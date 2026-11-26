import type { Appointment } from '@/entities/appointment';
import type { UserRole } from '@/entities/user';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import { isWithinSecretariatBusinessHours } from '@/utils/secretariat-business-hours';

export interface NotifyAppointmentCreatedRequest {
  appointment: Appointment;
  source: 'public_site' | 'internal_panel';
  creatorRole?: UserRole;
  now?: Date;
}

function formatBrazilianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

/**
 * Handles real-time push notifications on appointment creation:
 * - Pastoral agents (Padre) are NEVER notified in real time; they receive a single
 *   daily digest of confirmed appointments (Tue–Fri at 17:00 BRT) via cron.
 * - Secretariat (secretary / admin) is notified immediately ONLY during business hours
 *   (Tue–Fri 09:00–12:00 & 14:00–17:40; Sat 08:00–12:00). Outside those hours,
 *   appointments remain unnotified and are sent grouped when the office opens.
 */
export class NotifyAppointmentCreatedUseCase {
  constructor(
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private appointmentsDAF: AppointmentsDAF,
    private sendPushNotificationUseCase: SendPushNotificationUseCase,
  ) {}

  async execute(request: NotifyAppointmentCreatedRequest): Promise<void> {
    const { appointment, source, creatorRole } = request;
    const now = request.now ?? new Date();
    const formattedDate = formatBrazilianDate(appointment.appointmentDate);

    // If secretariat/admin created the appointment themselves, mark as already notified to secretariat
    if (
      source === 'internal_panel' &&
      (creatorRole === 'secretary' || creatorRole === 'admin')
    ) {
      await this.appointmentsDAF.markSecretaryNotified(
        [appointment.id],
        now.toISOString(),
      );
      return;
    }

    const shouldNotifySecretariat =
      source === 'public_site' ||
      (source === 'internal_panel' && creatorRole === 'pastoral_agent');

    if (!shouldNotifySecretariat) {
      return;
    }

    // Outside business hours: leave secretary_notified_at NULL so cron batches it at opening time
    if (!isWithinSecretariatBusinessHours(now)) {
      return;
    }

    const agent = await this.pastoralAgentsDAF.findById(appointment.agentId);
    const agentDisplayName = agent?.title
      ? `${agent.title} ${agent.name}`
      : agent?.name || 'Agente Pastoral';

    if (source === 'public_site') {
      await this.sendPushNotificationUseCase.execute({
        targetRoles: ['secretary', 'admin'],
        payload: {
          title: 'Nova solicitação de atendimento',
          body: `${appointment.requesterName} solicitou agendamento com ${agentDisplayName} para ${formattedDate} às ${appointment.startTime}.`,
          url: '/agenda-pastoral/solicitacoes',
        },
      });
    } else {
      await this.sendPushNotificationUseCase.execute({
        targetRoles: ['secretary', 'admin'],
        payload: {
          title: 'Novo atendimento agendado',
          body: `O agente ${agentDisplayName} agendou um atendimento com ${appointment.requesterName} para ${formattedDate} às ${appointment.startTime}.`,
          url: `/agenda-pastoral/agenda?date=${appointment.appointmentDate}`,
        },
      });
    }

    await this.appointmentsDAF.markSecretaryNotified(
      [appointment.id],
      now.toISOString(),
    );
  }
}
