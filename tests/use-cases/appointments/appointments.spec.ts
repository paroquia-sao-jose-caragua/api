import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAppointmentServicesDAF } from '../../database/in-memory-appointment-services-daf';
import { InMemoryPastoralAgentsDAF } from '../../database/in-memory-pastoral-agents-daf';
import { InMemoryAgentAvailabilitiesDAF } from '../../database/in-memory-agent-availabilities-daf';
import { InMemoryAppointmentsDAF } from '../../database/in-memory-appointments-daf';
import { InMemoryAppointmentSettingsDAF } from '../../database/in-memory-appointment-settings-daf';
import { ListAppointmentServicesUseCase } from '@/use-cases/appointments/list-appointment-services';
import { ListPastoralAgentsUseCase } from '@/use-cases/appointments/list-pastoral-agents';
import { GetAvailableSlotsUseCase } from '@/use-cases/appointments/get-available-slots';
import { CreateAppointmentUseCase } from '@/use-cases/appointments/create-appointment';
import { GetAppointmentByTokenUseCase } from '@/use-cases/appointments/get-appointment-by-token';
import { CancelAppointmentByTokenUseCase } from '@/use-cases/appointments/cancel-appointment-by-token';
import { ListAppointmentsUseCase } from '@/use-cases/appointments/list-appointments';
import { UpdateAppointmentStatusUseCase } from '@/use-cases/appointments/update-appointment-status';
import { GetAppointmentSettingsUseCase } from '@/use-cases/appointments/get-appointment-settings';
import { UpdateAppointmentSettingsUseCase } from '@/use-cases/appointments/update-appointment-settings';
import { SaveAppointmentServiceUseCase } from '@/use-cases/appointments/save-appointment-service';
import { GetAppointmentServiceUseCase } from '@/use-cases/appointments/get-appointment-service';
import { DeleteAppointmentServiceUseCase } from '@/use-cases/appointments/delete-appointment-service';
import { AppointmentSlotUnavailableError } from '@/use-cases/errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '@/use-cases/errors/address-required-for-service-error';
import { AppointmentsDisabledError } from '@/use-cases/errors/appointments-disabled-error';
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error';


describe('Appointments Use Cases', () => {
  let servicesDaf: InMemoryAppointmentServicesDAF;
  let agentsDaf: InMemoryPastoralAgentsDAF;
  let availabilitiesDaf: InMemoryAgentAvailabilitiesDAF;
  let appointmentsDaf: InMemoryAppointmentsDAF;
  let settingsDaf: InMemoryAppointmentSettingsDAF;

  beforeEach(async () => {
    servicesDaf = new InMemoryAppointmentServicesDAF();
    agentsDaf = new InMemoryPastoralAgentsDAF();
    availabilitiesDaf = new InMemoryAgentAvailabilitiesDAF();
    appointmentsDaf = new InMemoryAppointmentsDAF();
    settingsDaf = new InMemoryAppointmentSettingsDAF();

    // Seed test services
    await servicesDaf.save({
      id: 'srv-confession',
      title: 'Confissão',
      category: 'clergy_sacramental',
      description: 'Atendimento espiritual',
      defaultDurationMinutes: 30,
      requiresAddress: false,
      active: true,
    });

    await servicesDaf.save({
      id: 'srv-home-visit',
      title: 'Comunhão aos Enfermos',
      category: 'home_visit',
      description: 'Visita domiciliar',
      defaultDurationMinutes: 30,
      requiresAddress: true,
      active: true,
    });

    // Seed agent
    await agentsDaf.save(
      {
        id: 'agent-1',
        name: 'Padre André',
        title: 'Pe.',
        actingRole: 'Pároco',
        userId: 'user-priest-1',
        phone: '12999999999',
        email: 'padre@example.com',
        communityId: null,
        photoId: null,
        acceptsAppointments: true,
        active: true,
      },
      ['srv-confession', 'srv-home-visit']
    );

    // Seed availability: Wednesday (dayOfWeek = 3) 14:00 to 16:00 (slots: 14:00, 14:30, 15:00, 15:30)
    await availabilitiesDaf.saveAvailabilities('agent-1', [
      {
        id: 'avail-1',
        agentId: 'agent-1',
        communityId: null,
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '16:00',
        slotDurationMinutes: 30,
        active: true,
      },
    ]);
  });

  it('should list active appointment services', async () => {
    const sut = new ListAppointmentServicesUseCase(servicesDaf);
    const { services } = await sut.execute();

    expect(services).toHaveLength(2);
    expect(services[0].title).toBe('Confissão');
  });

  it('should list pastoral agents offering a specific service', async () => {
    const sut = new ListPastoralAgentsUseCase(agentsDaf);
    const { agents } = await sut.execute({ serviceId: 'srv-confession' });

    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('Padre André');
  });

  it('should return available slots for a future day matching agent availability', async () => {
    // 2026-10-07 is a Wednesday (dayOfWeek = 3)
    const sut = new GetAvailableSlotsUseCase(
      agentsDaf,
      availabilitiesDaf,
      appointmentsDaf,
      servicesDaf
    );

    const { slots } = await sut.execute({
      agentId: 'agent-1',
      date: '2026-10-07',
      serviceId: 'srv-confession',
    });

    expect(slots).toHaveLength(4);
    expect(slots.map((s) => s.startTime)).toEqual([
      '14:00',
      '14:30',
      '15:00',
      '15:30',
    ]);
  });

  it('should exclude slots that are already booked', async () => {
    // Book 14:30
    await appointmentsDaf.create({
      id: 'app-existing',
      agentId: 'agent-1',
      serviceId: 'srv-confession',
      communityId: null,
      requesterName: 'Maria Silva',
      requesterPhone: '12988888888',
      requesterEmail: null,
      requesterRelationship: null,
      patientName: null,
      patientAddress: null,
      patientConditions: null,
      appointmentDate: '2026-10-07',
      startTime: '14:30',
      endTime: '15:00',
      status: 'confirmed',
      accessToken: 'token-abc',
      requesterNotes: null,
      privatePastoralNotes: null,
      cancellationReason: null,
    });

    const sut = new GetAvailableSlotsUseCase(
      agentsDaf,
      availabilitiesDaf,
      appointmentsDaf,
      servicesDaf
    );

    const { slots } = await sut.execute({
      agentId: 'agent-1',
      date: '2026-10-07',
      serviceId: 'srv-confession',
    });

    expect(slots).toHaveLength(3);
    expect(slots.map((s) => s.startTime)).toEqual(['14:00', '15:00', '15:30']);
  });

  it('should create an appointment and generate an access token', async () => {
    const sut = new CreateAppointmentUseCase(
      appointmentsDaf,
      agentsDaf,
      servicesDaf
    );

    const { appointment } = await sut.execute({
      agentId: 'agent-1',
      serviceId: 'srv-confession',
      requesterName: 'João Silva',
      requesterPhone: '12991112233',
      appointmentDate: '2026-10-07',
      startTime: '14:00',
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.accessToken).toBeDefined();
    expect(appointment.status).toBe('pending');
    expect(appointment.endTime).toBe('14:30');

    // Trying to book the same slot again should throw AppointmentSlotUnavailableError
    await expect(
      sut.execute({
        agentId: 'agent-1',
        serviceId: 'srv-confession',
        requesterName: 'Outro Fiel',
        requesterPhone: '12999990000',
        appointmentDate: '2026-10-07',
        startTime: '14:00',
      })
    ).rejects.toBeInstanceOf(AppointmentSlotUnavailableError);
  });

  it('should require address when service requires address', async () => {
    const sut = new CreateAppointmentUseCase(
      appointmentsDaf,
      agentsDaf,
      servicesDaf
    );

    await expect(
      sut.execute({
        agentId: 'agent-1',
        serviceId: 'srv-home-visit',
        requesterName: 'Familiar',
        requesterPhone: '12991112233',
        appointmentDate: '2026-10-07',
        startTime: '14:00',
        patientAddress: '', // empty
      })
    ).rejects.toBeInstanceOf(AddressRequiredForServiceError);
  });

  it('should track and allow faithful to cancel by token', async () => {
    const createSut = new CreateAppointmentUseCase(
      appointmentsDaf,
      agentsDaf,
      servicesDaf
    );

    const { appointment } = await createSut.execute({
      agentId: 'agent-1',
      serviceId: 'srv-confession',
      requesterName: 'João Silva',
      requesterPhone: '12991112233',
      appointmentDate: '2026-10-07',
      startTime: '15:00',
    });

    const trackSut = new GetAppointmentByTokenUseCase(appointmentsDaf);
    const tracked = await trackSut.execute({ token: appointment.accessToken });
    expect(tracked.appointment.id).toBe(appointment.id);

    const cancelSut = new CancelAppointmentByTokenUseCase(appointmentsDaf);
    await cancelSut.execute({
      token: appointment.accessToken,
      cancellationReason: 'Imprevisto de trabalho',
    });

    const updated = await trackSut.execute({ token: appointment.accessToken });
    expect(updated.appointment.status).toBe('cancelled');
    expect(updated.appointment.cancellationReason).toBe(
      'Imprevisto de trabalho'
    );
  });

  it('should allow admin or agent to list and update appointment status', async () => {
    const createSut = new CreateAppointmentUseCase(
      appointmentsDaf,
      agentsDaf,
      servicesDaf
    );

    const { appointment } = await createSut.execute({
      agentId: 'agent-1',
      serviceId: 'srv-confession',
      requesterName: 'Fiel Teste',
      requesterPhone: '12991112233',
      appointmentDate: '2026-10-07',
      startTime: '15:30',
    });

    const listSut = new ListAppointmentsUseCase(appointmentsDaf, agentsDaf);
    const listRes = await listSut.execute({ userRole: 'admin' });
    expect(listRes.appointments).toHaveLength(1);

    const updateSut = new UpdateAppointmentStatusUseCase(appointmentsDaf, agentsDaf);
    await updateSut.execute({
      id: appointment.id,
      status: 'confirmed',
      privateNotes: 'Agendamento aprovado pelo padre',
    });

    const saved = await appointmentsDaf.findById(appointment.id);
    expect(saved?.status).toBe('confirmed');
    expect(saved?.privatePastoralNotes).toBe(
      'Agendamento aprovado pelo padre'
    );

    // Another pastoral agent user should be blocked
    await expect(() =>
      updateSut.execute({
        id: appointment.id,
        status: 'cancelled',
        userRole: 'pastoral_agent',
        userId: 'user-other-agent',
      })
    ).rejects.toBeInstanceOf(NotAllowedError);
  });

  it('should get and update global appointment settings', async () => {
    const getSut = new GetAppointmentSettingsUseCase(settingsDaf);
    const initial = await getSut.execute();
    expect(initial.settings.enabled).toBe(true);

    const updateSut = new UpdateAppointmentSettingsUseCase(settingsDaf);
    const updated = await updateSut.execute({
      enabled: false,
      suspendedTitle: 'Recesso Paroquial',
      suspendedMessage: 'Retornaremos em breve.',
    });

    expect(updated.settings.enabled).toBe(false);
    expect(updated.settings.suspendedTitle).toBe('Recesso Paroquial');
    expect(updated.settings.suspendedMessage).toBe('Retornaremos em breve.');
  });

  it('should block creating appointment when appointments are globally disabled', async () => {
    await settingsDaf.save({ enabled: false });

    const createSut = new CreateAppointmentUseCase(
      appointmentsDaf,
      agentsDaf,
      servicesDaf,
      settingsDaf
    );

    await expect(() =>
      createSut.execute({
        agentId: 'agent-1',
        serviceId: 'srv-confession',
        requesterName: 'Fiel Teste',
        requesterPhone: '12991112233',
        appointmentDate: '2026-10-07',
        startTime: '15:30',
      })
    ).rejects.toBeInstanceOf(AppointmentsDisabledError);
  });

  it('should block getting available slots when appointments are globally disabled', async () => {
    await settingsDaf.save({ enabled: false });

    const slotsSut = new GetAvailableSlotsUseCase(
      agentsDaf,
      availabilitiesDaf,
      appointmentsDaf,
      servicesDaf,
      settingsDaf
    );

    await expect(() =>
      slotsSut.execute({
        agentId: 'agent-1',
        date: '2026-10-07',
        serviceId: 'srv-confession',
      })
    ).rejects.toBeInstanceOf(AppointmentsDisabledError);
  });

  it('should be able to create, update, get and delete an appointment service', async () => {
    const saveSut = new SaveAppointmentServiceUseCase(servicesDaf);
    const getSut = new GetAppointmentServiceUseCase(servicesDaf);
    const deleteSut = new DeleteAppointmentServiceUseCase(servicesDaf);

    // Create
    const { service: created } = await saveSut.execute({
      title: 'Aconselhamento Matrimonial',
      category: 'pastoral',
      description: 'Atendimento para casais e noivos',
      defaultDurationMinutes: 45,
      requiresAddress: false,
      active: true,
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Aconselhamento Matrimonial');
    expect(created.category).toBe('pastoral');
    expect(created.defaultDurationMinutes).toBe(45);

    // Get
    const { service: retrieved } = await getSut.execute({ id: created.id });
    expect(retrieved.title).toBe('Aconselhamento Matrimonial');

    // Update
    const { service: updated } = await saveSut.execute({
      id: created.id,
      title: 'Aconselhamento Familiar e de Noivos',
      category: 'pastoral',
      defaultDurationMinutes: 50,
      requiresAddress: false,
      active: true,
    });

    expect(updated.title).toBe('Aconselhamento Familiar e de Noivos');
    expect(updated.defaultDurationMinutes).toBe(50);

    // Delete
    await deleteSut.execute({ id: created.id });
    const afterDelete = await servicesDaf.findById(created.id);
    expect(afterDelete).toBeNull();
  });
});

