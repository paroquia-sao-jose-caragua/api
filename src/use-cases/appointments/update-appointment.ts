import type {
  Appointment,
  AppointmentKind,
  PatientConditions,
  AppointmentStatus,
} from '@/entities/appointment';
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
  kind?: AppointmentKind;
  title?: string | null;
  agentId: string;
  serviceId?: string | null;
  communityId?: string | null;
  requesterName?: string | null;
  requesterPhone?: string | null;
  requesterEmail?: string | null;
  requesterRelationship?: string | null;
  patientName?: string | null;
  patientAddress?: string | null;
  patientConditions?: PatientConditions | null;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime?: string | null;
  durationMinutes?: number | null;
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
    kind,
    title,
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
    endTime: requestedEndTime,
    durationMinutes,
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

    const resolvedKind: AppointmentKind = kind || existing.kind || 'appointment';
    const startMinutes = timeToMinutes(startTime);
    let endTime: string;
    let resolvedServiceId: string | null = null;

    if (resolvedKind === 'commitment') {
      if (requestedEndTime && timeToMinutes(requestedEndTime) > startMinutes) {
        endTime = requestedEndTime;
      } else if (durationMinutes && durationMinutes > 0) {
        endTime = minutesToTime(startMinutes + durationMinutes);
      } else {
        const existingDuration = Math.max(
          15,
          timeToMinutes(existing.endTime) - timeToMinutes(existing.startTime)
        );
        endTime = minutesToTime(startMinutes + existingDuration);
      }
    } else {
      if (!serviceId) {
        throw new ServiceNotFoundError();
      }
      const service = await this.appointmentServicesDAF.findById(serviceId);
      if (!service || !service.active) {
        throw new ServiceNotFoundError();
      }
      if (service.requiresAddress && (!patientAddress || !patientAddress.trim())) {
        throw new AddressRequiredForServiceError();
      }
      resolvedServiceId = serviceId;
      endTime = minutesToTime(startMinutes + service.defaultDurationMinutes);
    }

    // Check slot overlap excluding current appointment id
    const overlappingCount = await this.appointmentsDAF.countOverlapping(
      agentId,
      appointmentDate,
      startTime,
      endTime,
      id
    );

    if (overlappingCount > 0) {
      throw new AppointmentSlotUnavailableError();
    }

    const updatedAppointment: Appointment = {
      ...existing,
      agentId,
      serviceId: resolvedServiceId,
      communityId: communityId || agent.communityId || null,
      kind: resolvedKind,
      title: resolvedKind === 'commitment' ? (title ?? existing.title ?? null)?.trim() || null : null,
      requesterName: requesterName?.trim() || null,
      requesterPhone: requesterPhone?.trim() || null,
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
