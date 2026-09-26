import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { GetAppointmentByTokenUseCase } from '@/use-cases/appointments/get-appointment-by-token';

export function makeGetAppointmentByTokenUseCase(c: DomainContext) {
  const daf = new D1AppointmentsDAF(c.env.DB);
  return new GetAppointmentByTokenUseCase(daf);
}
