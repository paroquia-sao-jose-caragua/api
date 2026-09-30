import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { GetAppointmentByIdUseCase } from '@/use-cases/appointments/get-appointment-by-id';

export function makeGetAppointmentByIdUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const pastoralAgentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  return new GetAppointmentByIdUseCase(appointmentsDaf, pastoralAgentsDaf);
}
