import type { Appointment } from '@/entities/appointment';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import {
  isAgentDigestDay,
  isWithinSecretariatBusinessHours,
} from '@/utils/secretariat-business-hours';

function formatBrazilianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export class SendScheduledAppointmentDigestsUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private sendPushNotificationUseCase: SendPushNotificationUseCase,
  ) {}

  /**
   * Sends a grouped push notification to secretariat/admin with all appointment requests
   * created outside business hours. Runs only during secretariat business hours.
   */
  async runSecretariatDigest(now = new Date()): Promise<{
    sent: boolean;
    count: number;
  }> {
    if (!isWithinSecretariatBusinessHours(now)) {
      return { sent: false, count: 0 };
    }

    const pending = await this.appointmentsDAF.findUnnotifiedForSecretary();
    if (pending.length === 0) {
      return { sent: false, count: 0 };
    }

    if (pending.length === 1) {
      const item = pending[0];
      const formattedDate = formatBrazilianDate(item.appointmentDate);
      await this.sendPushNotificationUseCase.execute({
        targetRoles: ['secretary', 'admin'],
        payload: {
          title: 'Nova solicitação de atendimento',
          body: `${item.requesterName || 'Um fiel'} solicitou atendimento para ${formattedDate} às ${item.startTime}.`,
          url: '/agenda-pastoral/solicitacoes',
        },
      });
    } else {
      await this.sendPushNotificationUseCase.execute({
        targetRoles: ['secretary', 'admin'],
        payload: {
          title: `${pending.length} novas solicitações de atendimento`,
          body: `Foram registradas ${pending.length} solicitações de atendimento fora do horário de expediente. Toque para revisar.`,
          url: '/agenda-pastoral/solicitacoes',
        },
      });
    }

    await this.appointmentsDAF.markSecretaryNotified(
      pending.map((a) => a.id),
      now.toISOString(),
    );

    return { sent: true, count: pending.length };
  }

  /**
   * Sends a single daily grouped push notification to each pastoral agent (Padre)
   * with all their CONFIRMED appointments not yet notified.
   * Runs Tue–Fri around 17:00 BRT (never on Monday or weekends).
   */
  async runAgentDailyDigest(now = new Date()): Promise<{
    notifiedAgents: number;
    appointmentsCount: number;
  }> {
    if (!isAgentDigestDay(now)) {
      return { notifiedAgents: 0, appointmentsCount: 0 };
    }

    const confirmed =
      await this.appointmentsDAF.findUnnotifiedConfirmedForAgents();
    if (confirmed.length === 0) {
      return { notifiedAgents: 0, appointmentsCount: 0 };
    }

    const groupedByAgent = new Map<string, Appointment[]>();
    for (const appt of confirmed) {
      const list = groupedByAgent.get(appt.agentId) ?? [];
      list.push(appt);
      groupedByAgent.set(appt.agentId, list);
    }

    let notifiedAgents = 0;

    for (const [agentId, items] of groupedByAgent.entries()) {
      const agent = await this.pastoralAgentsDAF.findById(agentId);

      if (agent?.userId) {
        if (items.length === 1) {
          const item = items[0];
          const formattedDate = formatBrazilianDate(item.appointmentDate);
          await this.sendPushNotificationUseCase.execute({
            targetUserIds: [agent.userId],
            payload: {
              title: 'Atendimento confirmado na sua agenda',
              body: `${item.requesterName || 'Fiel'} — ${formattedDate} às ${item.startTime}.`,
              url: `/minha-agenda/agenda?date=${item.appointmentDate}`,
            },
          });
        } else {
          await this.sendPushNotificationUseCase.execute({
            targetUserIds: [agent.userId],
            payload: {
              title: `${items.length} atendimentos confirmados na sua agenda`,
              body: `Você tem ${items.length} novos atendimentos confirmados. Toque para visualizar sua agenda.`,
              url: '/minha-agenda/agenda',
            },
          });
        }
        notifiedAgents += 1;
      }

      await this.appointmentsDAF.markAgentNotified(
        items.map((a) => a.id),
        now.toISOString(),
      );
    }

    return { notifiedAgents, appointmentsCount: confirmed.length };
  }
}
