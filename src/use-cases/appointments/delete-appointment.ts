import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { UserRole } from '@/entities/user';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface DeleteAppointmentUseCaseRequest {
  id: string;
  userRole?: UserRole;
  userId?: string;
}

export class DeleteAppointmentUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF?: PastoralAgentsDAF
  ) {}

  async execute({
    id,
    userRole,
    userId,
  }: DeleteAppointmentUseCaseRequest): Promise<void> {
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

    await this.appointmentsDAF.delete(id);
  }
}
