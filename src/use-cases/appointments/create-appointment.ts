import { ulid } from 'serverless-crypto-utils/id-generation';
import type { Appointment, PatientConditions } from '@/entities/appointment';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '../errors/service-not-found-error';
import { AppointmentSlotUnavailableError } from '../errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '../errors/address-required-for-service-error';
import { AppointmentsDisabledError } from '../errors/appointments-disabled-error';

interface CreateAppointmentUseCaseRequest {
  agentId: string;
  serviceId: string;
  communityId?: string | null;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string | null;
  requesterRelationship?: string | null;
  patientName?: string | null;
  patientAddress?: string | null;
  patientConditions?: PatientConditions | null;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  requesterNotes?: string | null;
}

interface CreateAppointmentUseCaseResponse {
  appointment: Appointment;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateSecureToken(): string {
  const part1 = ulid().toLowerCase();
  const randomChars = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `${part1}-${randomChars}-${timestamp}`;
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private appointmentServicesDAF: AppointmentServicesDAF,
    private appointmentSettingsDAF?: AppointmentSettingsDAF
  ) {}

  async execute({
    agentId,
    serviceId,
    communityId,
    requesterName,
    requesterPhone,
    requesterEmail,
    requesterRelationship,
    patientName,
    patientAddress,
    patientConditions,
    appointmentDate,
    startTime,
    requesterNotes,
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    if (this.appointmentSettingsDAF) {
      const settings = await this.appointmentSettingsDAF.get();
      if (!settings.enabled) {
        throw new AppointmentsDisabledError(settings.suspendedMessage);
      }
    }
    const agent = await this.pastoralAgentsDAF.findById(agentId);
    if (!agent || !agent.active || !agent.acceptsAppointments) {
      throw new PastoralAgentNotFoundError();
    }

    const service = await this.appointmentServicesDAF.findById(serviceId);
    if (!service || !service.active) {
      throw new ServiceNotFoundError();
    }

    if (service.requiresAddress && (!patientAddress || !patientAddress.trim())) {
      throw new AddressRequiredForServiceError();
    }

    // Check if slot is still available
    const existingCount = await this.appointmentsDAF.countBySlot(
      agentId,
      appointmentDate,
      startTime
    );

    if (existingCount > 0) {
      throw new AppointmentSlotUnavailableError();
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + service.defaultDurationMinutes;
    const endTime = minutesToTime(endMinutes);

    const appointment: Appointment = {
      id: ulid(),
      agentId,
      serviceId,
      communityId: communityId || agent.communityId || null,
      requesterName: requesterName.trim(),
      requesterPhone: requesterPhone.trim(),
      requesterEmail: requesterEmail?.trim() || null,
      requesterRelationship: requesterRelationship?.trim() || null,
      patientName: patientName?.trim() || null,
      patientAddress: patientAddress?.trim() || null,
      patientConditions: patientConditions || null,
      appointmentDate,
      startTime,
      endTime,
      status: 'pending',
      accessToken: generateSecureToken(),
      requesterNotes: requesterNotes?.trim() || null,
      privatePastoralNotes: null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
    };

    await this.appointmentsDAF.create(appointment);

    return { appointment };
  }
}
