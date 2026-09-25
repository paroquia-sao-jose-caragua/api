import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { CancelAppointmentByTokenUseCase } from '@/use-cases/appointments/cancel-appointment-by-token';

export function makeCancelAppointmentByTokenUseCase(c: DomainContext) {
  const daf = new D1AppointmentsDAF(c.env.DB);
  return new CancelAppointmentByTokenUseCase(daf);
}
