import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryPastoralAgentsDAF } from '../../database/in-memory-pastoral-agents-daf';
import { InMemoryAppointmentsDAF } from '../../database/in-memory-appointments-daf';
import { InMemoryPushSubscriptionsDAF } from '../../database/in-memory-push-subscriptions-daf';
import { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import { NotifyAppointmentCreatedUseCase } from '@/use-cases/appointments/notify-appointment-created';
import type { Appointment } from '@/entities/appointment';

describe('NotifyAppointmentCreatedUseCase', () => {
  let agentsDaf: InMemoryPastoralAgentsDAF;
  let appointmentsDaf: InMemoryAppointmentsDAF;
  let pushSubsDaf: InMemoryPushSubscriptionsDAF;
  let sendPushUseCase: SendPushNotificationUseCase;
  let sut: NotifyAppointmentCreatedUseCase;

  const mockAgentId = '01AGT000000000000000000001';
  const mockAgentUserId = '01USR_AGENT_00000000000001';
  const BUSINESS_HOURS_DATE = new Date('2026-11-26T13:00:00Z'); // Thu 10:00 BRT
  const AFTER_HOURS_DATE = new Date('2026-11-26T22:00:00Z'); // Thu 19:00 BRT

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
    appointmentsDaf = new InMemoryAppointmentsDAF();
    pushSubsDaf = new InMemoryPushSubscriptionsDAF();
    sendPushUseCase = new SendPushNotificationUseCase(pushSubsDaf);
    sut = new NotifyAppointmentCreatedUseCase(
      agentsDaf,
      appointmentsDaf,
      sendPushUseCase,
    );

    await appointmentsDaf.create({ ...mockAppointment });
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

  it('should notify only secretariat in real time during business hours when requested on public site', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: mockAppointment,
      source: 'public_site',
      now: BUSINESS_HOURS_DATE,
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith({
      targetRoles: ['secretary', 'admin'],
      payload: {
        title: 'Nova solicitação de atendimento',
        body: 'Maria Silva solicitou agendamento com Pe. Padre Marcelo para 15/10/2026 às 14:00.',
        url: '/agenda-pastoral/solicitacoes',
      },
    });
    expect(appointmentsDaf.items[0].secretaryNotifiedAt).toBeTruthy();
  });

  it('should defer secretariat notification outside business hours', async () => {
    const executeSpy = vi.spyOn(sendPushUseCase, 'execute').mockResolvedValue({
      sentCount: 1,
      failedCount: 0,
    });

    await sut.execute({
      appointment: mockAppointment,
      source: 'public_site',
      now: AFTER_HOURS_DATE,
    });

    expect(executeSpy).not.toHaveBeenCalled();
    expect(appointmentsDaf.items[0].secretaryNotifiedAt).toBeFalsy();
  });

  it('should NOT notify agent in real time when secretariat creates an appointment (batched at 17h)', async () => {
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
      now: BUSINESS_HOURS_DATE,
    });

    expect(executeSpy).not.toHaveBeenCalled();
    expect(appointmentsDaf.items[0].secretaryNotifiedAt).toBeTruthy();
    expect(appointmentsDaf.items[0].agentNotifiedAt).toBeFalsy();
  });

  it('should notify secretariat during business hours when appointment is created by pastoral agent', async () => {
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
      now: BUSINESS_HOURS_DATE,
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
