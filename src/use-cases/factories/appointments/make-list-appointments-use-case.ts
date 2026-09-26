import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { ListAppointmentsUseCase } from '@/use-cases/appointments/list-appointments';

export function makeListAppointmentsUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const agentsDaf = new D1PastoralAgentsDAF(c.env.DB);

  return new ListAppointmentsUseCase(appointmentsDaf, agentsDaf);
}
