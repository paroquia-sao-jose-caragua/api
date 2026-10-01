import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { DeleteAppointmentUseCase } from '@/use-cases/appointments/delete-appointment';

export function makeDeleteAppointmentUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const pastoralAgentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  return new DeleteAppointmentUseCase(appointmentsDaf, pastoralAgentsDaf);
}
