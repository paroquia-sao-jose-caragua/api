import { ulid } from 'serverless-crypto-utils/id-generation';
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
import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '../errors/service-not-found-error';
import { AppointmentSlotUnavailableError } from '../errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '../errors/address-required-for-service-error';
import { AppointmentsDisabledError } from '../errors/appointments-disabled-error';
import { AppointmentAdvanceNoticeError } from '../errors/appointment-advance-notice-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { getBrazilNowParts } from './date-helpers';

interface CreateAppointmentUseCaseRequest {
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
  userRole?: UserRole;
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
    kind = 'appointment',
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
    userRole,
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    const isStaff =
      userRole === 'admin' ||
      userRole === 'secretary' ||
      userRole === 'pastoral_agent';

    if (kind === 'commitment' && !isStaff) {
      throw new NotAllowedError();
    }

    if (this.appointmentSettingsDAF && !isStaff) {
      const settings = await this.appointmentSettingsDAF.get();
      if (!settings.enabled) {
        throw new AppointmentsDisabledError(settings.suspendedMessage);
      }
    }

    if (!isStaff) {
      const { todayDate } = getBrazilNowParts();
      if (appointmentDate <= todayDate) {
        throw new AppointmentAdvanceNoticeError();
      }
    }
    const agent = await this.pastoralAgentsDAF.findById(agentId);
    if (!agent || !agent.active || !agent.acceptsAppointments) {
      throw new PastoralAgentNotFoundError();
    }

    const startMinutes = timeToMinutes(startTime);
    let endTime: string;
    let resolvedServiceId: string | null = null;

    if (kind === 'commitment') {
      if (requestedEndTime && timeToMinutes(requestedEndTime) > startMinutes) {
        endTime = requestedEndTime;
      } else {
        const mins = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
        endTime = minutesToTime(startMinutes + mins);
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

    // Check if time range overlaps with any existing non-cancelled appointment/commitment
    const overlappingCount = await this.appointmentsDAF.countOverlapping(
      agentId,
      appointmentDate,
      startTime,
      endTime
    );

    if (overlappingCount > 0) {
      throw new AppointmentSlotUnavailableError();
    }

    const initialStatus: AppointmentStatus =
      status || (isStaff ? 'confirmed' : 'pending');

    const appointment: Appointment = {
      id: ulid(),
      agentId,
      serviceId: resolvedServiceId,
      communityId: communityId || agent.communityId || null,
      kind,
      title: kind === 'commitment' ? title?.trim() || null : null,
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
      status: initialStatus,
      accessToken: generateSecureToken(),
      requesterNotes: requesterNotes?.trim() || null,
      privatePastoralNotes:
        isStaff && privatePastoralNotes ? privatePastoralNotes.trim() : null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
    };

    await this.appointmentsDAF.create(appointment);

    return { appointment };
  }
}

