import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { D1AgentAvailabilitiesDAF } from '@/services/database/d1/d1-agent-availabilities-daf';
import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1AppointmentServicesDAF } from '@/services/database/d1/d1-appointment-services-daf';
import { D1AppointmentSettingsDAF } from '@/services/database/d1/d1-appointment-settings-daf';
import { GetAvailableSlotsUseCase } from '@/use-cases/appointments/get-available-slots';

export function makeGetAvailableSlotsUseCase(c: DomainContext) {
  const agentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  const availabilitiesDaf = new D1AgentAvailabilitiesDAF(c.env.DB);
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const servicesDaf = new D1AppointmentServicesDAF(c.env.DB);
  const settingsDaf = new D1AppointmentSettingsDAF(c.env.DB);

  return new GetAvailableSlotsUseCase(
    agentsDaf,
    availabilitiesDaf,
    appointmentsDaf,
    servicesDaf,
    settingsDaf
  );
}
