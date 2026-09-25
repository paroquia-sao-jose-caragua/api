import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { D1AppointmentServicesDAF } from '@/services/database/d1/d1-appointment-services-daf';
import { D1AppointmentSettingsDAF } from '@/services/database/d1/d1-appointment-settings-daf';
import { CreateAppointmentUseCase } from '@/use-cases/appointments/create-appointment';

export function makeCreateAppointmentUseCase(c: DomainContext) {
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const agentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  const servicesDaf = new D1AppointmentServicesDAF(c.env.DB);
  const settingsDaf = new D1AppointmentSettingsDAF(c.env.DB);

  return new CreateAppointmentUseCase(
    appointmentsDaf,
    agentsDaf,
    servicesDaf,
    settingsDaf
  );
}
