import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { D1AppointmentServicesDAF } from '@/services/database/d1/d1-appointment-services-daf';
import { UpdateAppointmentUseCase } from '@/use-cases/appointments/update-appointment';

export function makeUpdateAppointmentUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const pastoralAgentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  const servicesDaf = new D1AppointmentServicesDAF(c.env.DB);
  return new UpdateAppointmentUseCase(appointmentsDaf, pastoralAgentsDaf, servicesDaf);
}
