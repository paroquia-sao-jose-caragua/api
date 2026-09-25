import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { UpdateAppointmentStatusUseCase } from '@/use-cases/appointments/update-appointment-status';

export function makeUpdateAppointmentStatusUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const pastoralAgentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  return new UpdateAppointmentStatusUseCase(appointmentsDaf, pastoralAgentsDaf);
}
