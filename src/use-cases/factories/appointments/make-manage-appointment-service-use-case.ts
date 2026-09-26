import { D1AppointmentServicesDAF } from '@/services/database/d1/d1-appointment-services-daf';
import { SaveAppointmentServiceUseCase } from '@/use-cases/appointments/save-appointment-service';
import { DeleteAppointmentServiceUseCase } from '@/use-cases/appointments/delete-appointment-service';
import { GetAppointmentServiceUseCase } from '@/use-cases/appointments/get-appointment-service';

export function makeSaveAppointmentServiceUseCase(c: DomainContext) {
  const daf = new D1AppointmentServicesDAF(c.env.DB);
  return new SaveAppointmentServiceUseCase(daf);
}

export function makeDeleteAppointmentServiceUseCase(c: DomainContext) {
  const daf = new D1AppointmentServicesDAF(c.env.DB);
  return new DeleteAppointmentServiceUseCase(daf);
}

export function makeGetAppointmentServiceUseCase(c: DomainContext) {
  const daf = new D1AppointmentServicesDAF(c.env.DB);
  return new GetAppointmentServiceUseCase(daf);
}
