import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Appointment } from '@/entities/appointment';
import type { PastoralAgent } from '@/entities/pastoral-agent';
import { InMemoryAppointmentsDAF } from '../../database/in-memory-appointments-daf';
import { NotifyAppointmentCreatedUseCase } from '@/use-cases/appointments/notify-appointment-created';
import { SendScheduledAppointmentDigestsUseCase } from '@/use-cases/appointments/send-scheduled-appointment-digests';
import {
  isAgentDigestDay,
  isWithinSecretariatBusinessHours,
} from '@/utils/secretariat-business-hours';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: overrides.id ?? 'appt-1',
    agentId: overrides.agentId ?? 'agent-1',
    serviceId: 'service-1',
    communityId: 'comm-1',
    kind: 'appointment',
    title: null,
    requesterName: overrides.requesterName ?? 'Maria da Silva',
    requesterPhone: '12999999999',
    requesterEmail: null,
    requesterRelationship: null,
    patientName: null,
    patientAddress: null,
    patientConditions: null,
    appointmentDate: overrides.appointmentDate ?? '2026-11-27',
    startTime: overrides.startTime ?? '10:00',
    endTime: overrides.endTime ?? '10:30',
    status: overrides.status ?? 'pending',
    accessToken: overrides.accessToken ?? `tok-${overrides.id ?? '1'}`,
    requesterNotes: null,
    privatePastoralNotes: null,
    cancellationReason: null,
    secretaryNotifiedAt: overrides.secretaryNotifiedAt ?? null,
    agentNotifiedAt: overrides.agentNotifiedAt ?? null,
  };
}

describe('Secretariat Business Hours & Agent Digest Schedule', () => {
  it('recognizes Tue-Fri 09:00-12:00 and 14:00-17:40 BRT as open', () => {
    // 2026-11-26 is Thursday (UTC-3)
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T12:00:00Z'))).toBe(true); // 09:00 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T15:00:00Z'))).toBe(true); // 12:00 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T16:00:00Z'))).toBe(false); // 13:00 BRT (lunch)
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T17:00:00Z'))).toBe(true); // 14:00 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T20:40:00Z'))).toBe(true); // 17:40 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-26T20:41:00Z'))).toBe(false); // 17:41 BRT
  });

  it('recognizes Saturday 08:00-12:00 BRT as open and Sunday/Monday as closed', () => {
    // 2026-11-28 is Saturday
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-28T11:00:00Z'))).toBe(true); // 08:00 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-28T15:00:00Z'))).toBe(true); // 12:00 BRT
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-28T15:01:00Z'))).toBe(false); // 12:01 BRT
    // 2026-11-29 Sunday, 2026-11-30 Monday
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-29T13:00:00Z'))).toBe(false);
    expect(isWithinSecretariatBusinessHours(new Date('2026-11-30T13:00:00Z'))).toBe(false);
  });

  it('allows agent daily digest only Tue-Fri (excluding Monday and weekends)', () => {
    expect(isAgentDigestDay(new Date('2026-11-30T20:00:00Z'))).toBe(false); // Mon
    expect(isAgentDigestDay(new Date('2026-12-01T20:00:00Z'))).toBe(true); // Tue
    expect(isAgentDigestDay(new Date('2026-11-26T20:00:00Z'))).toBe(true); // Thu
    expect(isAgentDigestDay(new Date('2026-11-28T20:00:00Z'))).toBe(false); // Sat
    expect(isAgentDigestDay(new Date('2026-11-29T20:00:00Z'))).toBe(false); // Sun
  });
});

describe('Appointment Push Notifications & Scheduled Digests', () => {
  let appointmentsDaf: InMemoryAppointmentsDAF;
  let sendPushMock: { execute: ReturnType<typeof vi.fn> };
  let agentsDafMock: { findById: ReturnType<typeof vi.fn> };
  let notifyCreated: NotifyAppointmentCreatedUseCase;
  let scheduledDigests: SendScheduledAppointmentDigestsUseCase;

  beforeEach(() => {
    appointmentsDaf = new InMemoryAppointmentsDAF();
    sendPushMock = { execute: vi.fn().mockResolvedValue({ sentCount: 1, failedCount: 0 }) };
    agentsDafMock = {
      findById: vi.fn().mockResolvedValue({
        id: 'agent-1',
        name: 'José',
        title: 'Pe.',
        userId: 'user-padre-1',
      } as Partial<PastoralAgent>),
    };

    notifyCreated = new NotifyAppointmentCreatedUseCase(
      agentsDafMock as any,
      appointmentsDaf,
      sendPushMock as any,
    );
    scheduledDigests = new SendScheduledAppointmentDigestsUseCase(
      appointmentsDaf,
      agentsDafMock as any,
      sendPushMock as any,
    );
  });

  it('notifies secretariat immediately during business hours and NEVER notifies agent in real time', async () => {
    const appt = makeAppointment({ id: 'a1' });
    await appointmentsDaf.create(appt);

    await notifyCreated.execute({
      appointment: appt,
      source: 'public_site',
      now: new Date('2026-11-26T13:00:00Z'), // Thu 10:00 BRT
    });

    expect(sendPushMock.execute).toHaveBeenCalledTimes(1);
    expect(sendPushMock.execute).toHaveBeenCalledWith(
      expect.objectContaining({ targetRoles: ['secretary', 'admin'] }),
    );
    expect(appointmentsDaf.items[0].secretaryNotifiedAt).toBeTruthy();
    expect(appointmentsDaf.items[0].agentNotifiedAt).toBeNull();
  });

  it('defers secretariat notification outside business hours and sends grouped digest at opening', async () => {
    const a1 = makeAppointment({ id: 'a1', requesterName: 'João' });
    const a2 = makeAppointment({ id: 'a2', requesterName: 'Ana' });
    await appointmentsDaf.create(a1);
    await appointmentsDaf.create(a2);

    // Sunday 20:00 BRT -> closed
    await notifyCreated.execute({
      appointment: a1,
      source: 'public_site',
      now: new Date('2026-11-29T23:00:00Z'),
    });
    await notifyCreated.execute({
      appointment: a2,
      source: 'public_site',
      now: new Date('2026-11-29T23:10:00Z'),
    });

    expect(sendPushMock.execute).not.toHaveBeenCalled();

    // Tuesday 09:00 BRT -> opens and sends 1 grouped push
    const res = await scheduledDigests.runSecretariatDigest(
      new Date('2026-12-01T12:00:00Z'),
    );

    expect(res).toEqual({ sent: true, count: 2 });
    expect(sendPushMock.execute).toHaveBeenCalledTimes(1);
    expect(sendPushMock.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        targetRoles: ['secretary', 'admin'],
        payload: expect.objectContaining({
          title: '2 novas solicitações de atendimento',
        }),
      }),
    );
    expect(appointmentsDaf.items[0].secretaryNotifiedAt).toBeTruthy();
    expect(appointmentsDaf.items[1].secretaryNotifiedAt).toBeTruthy();
  });

  it('sends daily 17:00 digest to pastoral agent with CONFIRMED appointments only', async () => {
    const confirmed1 = makeAppointment({ id: 'c1', status: 'confirmed' });
    const confirmed2 = makeAppointment({ id: 'c2', status: 'confirmed' });
    const pending = makeAppointment({ id: 'p1', status: 'pending' });
    await appointmentsDaf.create(confirmed1);
    await appointmentsDaf.create(confirmed2);
    await appointmentsDaf.create(pending);

    // Thursday 17:00 BRT
    const res = await scheduledDigests.runAgentDailyDigest(
      new Date('2026-11-26T20:00:00Z'),
    );

    expect(res).toEqual({ notifiedAgents: 1, appointmentsCount: 2 });
    expect(sendPushMock.execute).toHaveBeenCalledTimes(1);
    expect(sendPushMock.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        targetUserIds: ['user-padre-1'],
        payload: expect.objectContaining({
          title: '2 atendimentos confirmados na sua agenda',
        }),
      }),
    );
    expect(appointmentsDaf.items.find((i) => i.id === 'c1')?.agentNotifiedAt).toBeTruthy();
    expect(appointmentsDaf.items.find((i) => i.id === 'c2')?.agentNotifiedAt).toBeTruthy();
    expect(appointmentsDaf.items.find((i) => i.id === 'p1')?.agentNotifiedAt).toBeNull();
  });
});
