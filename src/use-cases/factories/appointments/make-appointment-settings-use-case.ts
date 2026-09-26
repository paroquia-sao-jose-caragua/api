import { D1AppointmentSettingsDAF } from '@/services/database/d1/d1-appointment-settings-daf';
import { GetAppointmentSettingsUseCase } from '@/use-cases/appointments/get-appointment-settings';
import { UpdateAppointmentSettingsUseCase } from '@/use-cases/appointments/update-appointment-settings';

export function makeGetAppointmentSettingsUseCase(c: DomainContext) {
  const daf = new D1AppointmentSettingsDAF(c.env.DB);
  return new GetAppointmentSettingsUseCase(daf);
}

export function makeUpdateAppointmentSettingsUseCase(c: DomainContext) {
  const daf = new D1AppointmentSettingsDAF(c.env.DB);
  return new UpdateAppointmentSettingsUseCase(daf);
}
