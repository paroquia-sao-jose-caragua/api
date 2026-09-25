import type { Appointment, AppointmentStatus } from '@/entities/appointment';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { UserRole } from '@/entities/user';

interface ListAppointmentsUseCaseRequest {
  userRole: UserRole;
  userId?: string;
  agentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
}

interface ListAppointmentsUseCaseResponse {
  appointments: Appointment[];
}

export class ListAppointmentsUseCase {
  constructor(
    private appointmentsDAF: AppointmentsDAF,
    private pastoralAgentsDAF: PastoralAgentsDAF
  ) {}

  async execute({
    userRole,
    userId,
    agentId,
    date,
    startDate,
    endDate,
    status,
  }: ListAppointmentsUseCaseRequest): Promise<ListAppointmentsUseCaseResponse> {
    let effectiveAgentId = agentId;

    if (userRole === 'pastoral_agent' && userId) {
      const agent = await this.pastoralAgentsDAF.findByUserId(userId);
      if (agent) {
        effectiveAgentId = agent.id;
      }
    }

    const appointments = await this.appointmentsDAF.list({
      agentId: effectiveAgentId,
      date,
      startDate,
      endDate,
      status,
    });

    return { appointments };
  }
}
