import type { Appointment } from '@/entities/appointment';
import type { UserRole } from '@/entities/user';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';

export interface NotifyAppointmentCreatedRequest {
  appointment: Appointment;
  source: 'public_site' | 'internal_panel';
  creatorRole?: UserRole;
}

function formatBrazilianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export class NotifyAppointmentCreatedUseCase {
  constructor(
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private sendPushNotificationUseCase: SendPushNotificationUseCase,
  ) {}

  async execute(request: NotifyAppointmentCreatedRequest): Promise<void> {
    const { appointment, source, creatorRole } = request;
    const formattedDate = formatBrazilianDate(appointment.appointmentDate);

    const agent = await this.pastoralAgentsDAF.findById(appointment.agentId);
    const agentDisplayName = agent?.title
      ? `${agent.title} ${agent.name}`
      : agent?.name || 'Agente Pastoral';

    if (source === 'public_site') {
      // 1. Notificar apenas o agente pastoral envolvido (se tiver usuário vinculado)
      if (agent?.userId) {
        await this.sendPushNotificationUseCase.execute({
          targetUserIds: [agent.userId],
          payload: {
            title: 'Nova solicitação de atendimento',
            body: `${appointment.requesterName} solicitou um atendimento para ${formattedDate} às ${appointment.startTime}.`,
            url: '/minha-agenda/solicitacoes',
          },
        });
      }

      // 2. Notificar a secretaria da paróquia
      await this.sendPushNotificationUseCase.execute({
        targetRoles: ['secretary', 'admin'],
        payload: {
          title: 'Nova solicitação de atendimento',
          body: `${appointment.requesterName} solicitou agendamento com ${agentDisplayName} para ${formattedDate} às ${appointment.startTime}.`,
          url: '/agenda-pastoral/solicitacoes',
        },
      });
      return;
    }

    if (source === 'internal_panel') {
      const isSecretariat =
        creatorRole === 'secretary' || creatorRole === 'admin';
      const isPastoralAgent = creatorRole === 'pastoral_agent';

      if (isSecretariat) {
        // Se a secretaria incluiu e já confirmou -> agente recebe notificação e abre a agenda no dia
        if (appointment.status === 'confirmed' && agent?.userId) {
          await this.sendPushNotificationUseCase.execute({
            targetUserIds: [agent.userId],
            payload: {
              title: 'Novo atendimento na sua agenda',
              body: `Um novo atendimento com ${appointment.requesterName} foi incluído para ${formattedDate} às ${appointment.startTime}.`,
              url: `/minha-agenda/agenda?date=${appointment.appointmentDate}`,
            },
          });
          return;
        }

        // Se a secretaria incluiu e deixou como pendente -> agente recebe notificação para aprovar ou não
        if (appointment.status === 'pending' && agent?.userId) {
          await this.sendPushNotificationUseCase.execute({
            targetUserIds: [agent.userId],
            payload: {
              title: 'Nova solicitação para aprovação',
              body: `A secretaria incluiu uma solicitação de atendimento com ${appointment.requesterName} que aguarda sua aprovação.`,
              url: '/minha-agenda/solicitacoes',
            },
          });
          return;
        }
      }

      // Se foi o agente que incluiu -> a secretaria tem que ser notificada
      if (isPastoralAgent) {
        await this.sendPushNotificationUseCase.execute({
          targetRoles: ['secretary', 'admin'],
          payload: {
            title: 'Novo atendimento agendado',
            body: `O agente ${agentDisplayName} agendou um atendimento com ${appointment.requesterName} para ${formattedDate} às ${appointment.startTime}.`,
            url: `/agenda-pastoral/agenda?date=${appointment.appointmentDate}`,
          },
        });
        return;
      }
    }
  }
}
