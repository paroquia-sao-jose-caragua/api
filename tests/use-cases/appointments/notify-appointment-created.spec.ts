import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryPastoralAgentsDAF } from '../../database/in-memory-pastoral-agents-daf';
import { InMemoryPushSubscriptionsDAF } from '../../database/in-memory-push-subscriptions-daf';
import { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import { NotifyAppointmentCreatedUseCase } from '@/use-cases/appointments/notify-appointment-created';
import type { Appointment } from '@/entities/appointment';

describe('NotifyAppointmentCreatedUseCase', () => {
  let agentsDaf: InMemoryPastoralAgentsDAF;
  let pushSubsDaf: InMemoryPushSubscriptionsDAF;
  let sendPushUseCase: SendPushNotificationUseCase;
  let sut: NotifyAppointmentCreatedUseCase;

  const mockAgentId = '01AGT000000000000000000001';
  const mockAgentUserId = '01USR_AGENT_00000000000001';

  const mockAppointment: Appointment = {
    id: '01APP000000000000000000001',
    agentId: mockAgentId,
    serviceId: '01SRV000000000000000000001',
    communityId: '01COM000000000000000000001',
    requesterName: 'Maria Silva',
    requesterPhone: '12999999999',
    requesterEmail: 'maria@example.com',
    requesterRelationship: null,
    patientName: null,
    patientAddress: null,
    patientConditions: null,
    appointmentDate: '2026-10-15',
    startTime: '14:00',
    endTime: '15:00',
    status: 'pending',
    accessToken: 'secure-token-123',
    requesterNotes: 'Preciso de orientação pastoral',
    privatePastoralNotes: null,
    cancellationReason: null,
    createdAt: '2026-10-03T10:00:00Z',
  };

  beforeEach(async () => {
    agentsDaf = new InMemoryPastoralAgentsDAF();
    pushSubsDaf = new InMemoryPushSubscriptionsDAF();
    sendPushUseCase = new SendPushNotificationUseCase(pushSubsDaf);
    sut = new NotifyAppointmentCreatedUseCase(agentsDaf, sendPushUseCase);

    await agentsDaf.save({
      id: mockAgentId,
      name: 'Padre Marcelo',
      title: 'Pe.',
      actingRole: 'Pároco',
      userId: mockAgentUserId,
      phone: '12988888888',
      email: 'pe.marcelo@paroquia.org',
      communityId: null,
      photoId: null,
      acceptsAppointments: true,
      active: true,
    });
  });

  it('should notify the involved agent and secretariat when requested on public site', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: mockAppointment,
      source: 'public_site',
    });

    expect(executeSpy).toHaveBeenCalledTimes(2);

    // Call 1: Pastoral agent
    expect(executeSpy).toHaveBeenNthCalledWith(1, {
      targetUserIds: [mockAgentUserId],
      payload: {
        title: 'Nova solicitação de atendimento',
        body: 'Maria Silva solicitou um atendimento para 15/10/2026 às 14:00.',
        url: '/minha-agenda/solicitacoes',
      },
    });

    // Call 2: Secretariat
    expect(executeSpy).toHaveBeenNthCalledWith(2, {
      targetRoles: ['secretary', 'admin'],
      payload: {
        title: 'Nova solicitação de atendimento',
        body: 'Maria Silva solicitou agendamento com Pe. Padre Marcelo para 15/10/2026 às 14:00.',
        url: '/agenda-pastoral/solicitacoes',
      },
    });
  });

  it('should notify the agent with schedule link on date when secretariat creates and confirms', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: {
        ...mockAppointment,
        status: 'confirmed',
      },
      source: 'internal_panel',
      creatorRole: 'secretary',
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith({
      targetUserIds: [mockAgentUserId],
      payload: {
        title: 'Novo atendimento na sua agenda',
        body: 'Um novo atendimento com Maria Silva foi incluído para 15/10/2026 às 14:00.',
        url: '/minha-agenda/agenda?date=2026-10-15',
      },
    });
  });

  it('should notify the agent for approval when secretariat creates and leaves pending', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: {
        ...mockAppointment,
        status: 'pending',
      },
      source: 'internal_panel',
      creatorRole: 'secretary',
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith({
      targetUserIds: [mockAgentUserId],
      payload: {
        title: 'Nova solicitação para aprovação',
        body: 'A secretaria incluiu uma solicitação de atendimento com Maria Silva que aguarda sua aprovação.',
        url: '/minha-agenda/solicitacoes',
      },
    });
  });

  it('should notify secretariat when appointment is created by pastoral agent', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: {
        ...mockAppointment,
        status: 'confirmed',
      },
      source: 'internal_panel',
      creatorRole: 'pastoral_agent',
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith({
      targetRoles: ['secretary', 'admin'],
      payload: {
        title: 'Novo atendimento agendado',
        body: 'O agente Pe. Padre Marcelo agendou um atendimento com Maria Silva para 15/10/2026 às 14:00.',
        url: '/agenda-pastoral/agenda?date=2026-10-15',
      },
    });
  });
});
