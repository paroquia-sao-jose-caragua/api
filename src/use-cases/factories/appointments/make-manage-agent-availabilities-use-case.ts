import { D1AgentAvailabilitiesDAF } from '@/services/database/d1/d1-agent-availabilities-daf';
import { ManageAgentAvailabilitiesUseCase } from '@/use-cases/appointments/manage-agent-availabilities';

export function makeManageAgentAvailabilitiesUseCase(c: DomainContext) {
  const daf = new D1AgentAvailabilitiesDAF(c.env.DB);
  return new ManageAgentAvailabilitiesUseCase(daf);
}
