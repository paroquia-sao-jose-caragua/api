import type { AppointmentStatus } from '@/entities/appointment';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { UserRole } from '@/entities/user';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface UpdateAppointmentStatusUseCaseRequest {
  id: string;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  privateNotes?: string | null;
  userRole?: UserRole;
  userId?: string;
}

interface UpdateAppointmentStatusUseCaseResponse {
  success: boolean;
}

export class UpdateAppointmentStatusUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF?: PastoralAgentsDAF
  ) {}

  async execute({
    id,
    status,
    cancellationReason,
    privateNotes,
    userRole,
    userId,
  }: UpdateAppointmentStatusUseCaseRequest): Promise<UpdateAppointmentStatusUseCaseResponse> {
    const appointment = await this.appointmentsDAF.findById(id);

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (userRole === 'pastoral_agent' && userId && this.pastoralAgentsDAF) {
      const agent = await this.pastoralAgentsDAF.findByUserId(userId);
      if (!agent || agent.id !== appointment.agentId) {
        throw new NotAllowedError();
      }
    }

    await this.appointmentsDAF.updateStatus(
      id,
      status,
      cancellationReason,
      privateNotes
    );

    return { success: true };
  }
}
