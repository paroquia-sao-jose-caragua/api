import { D1AppointmentServicesDAF } from '@/services/database/d1/d1-appointment-services-daf';
import { ListAppointmentServicesUseCase } from '@/use-cases/appointments/list-appointment-services';

export function makeListAppointmentServicesUseCase(c: DomainContext) {
  const daf = new D1AppointmentServicesDAF(c.env.DB);
  return new ListAppointmentServicesUseCase(daf);
}
