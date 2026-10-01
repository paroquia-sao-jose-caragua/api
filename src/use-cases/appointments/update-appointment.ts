import type { Appointment, PatientConditions, AppointmentStatus } from '@/entities/appointment';
import type { UserRole } from '@/entities/user';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '../errors/service-not-found-error';
import { AppointmentSlotUnavailableError } from '../errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '../errors/address-required-for-service-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface UpdateAppointmentUseCaseRequest {
  id: string;
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
  status?: AppointmentStatus;
  privatePastoralNotes?: string | null;
  cancellationReason?: string | null;
  userRole?: UserRole;
  userId?: string;
}

interface UpdateAppointmentUseCaseResponse {
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

export class UpdateAppointmentUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private appointmentServicesDAF: AppointmentServicesDAF
  ) {}

  async execute({
    id,
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
    status,
    privatePastoralNotes,
    cancellationReason,
    userRole,
    userId,
  }: UpdateAppointmentUseCaseRequest): Promise<UpdateAppointmentUseCaseResponse> {
    const existing = await this.appointmentsDAF.findById(id);
    if (!existing) {
      throw new AppointmentNotFoundError();
    }

    if (userRole === 'pastoral_agent' && userId) {
      const currentAgent = await this.pastoralAgentsDAF.findByUserId(userId);
      if (!currentAgent || currentAgent.id !== existing.agentId) {
        throw new NotAllowedError();
      }
      if (agentId !== currentAgent.id) {
        throw new NotAllowedError();
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

    // Check slot availability excluding current appointment id
    const existingCount = await this.appointmentsDAF.countBySlot(
      agentId,
      appointmentDate,
      startTime,
      id
    );

    if (existingCount > 0) {
      throw new AppointmentSlotUnavailableError();
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + service.defaultDurationMinutes;
    const endTime = minutesToTime(endMinutes);

    const updatedAppointment: Appointment = {
      ...existing,
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
      status: status || existing.status,
      requesterNotes: requesterNotes?.trim() || null,
      privatePastoralNotes: privatePastoralNotes?.trim() || null,
      cancellationReason: cancellationReason?.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    await this.appointmentsDAF.update(updatedAppointment);

    return { appointment: updatedAppointment };
  }
}
