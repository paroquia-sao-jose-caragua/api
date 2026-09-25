import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { ListPastoralAgentsUseCase } from '@/use-cases/appointments/list-pastoral-agents';

export function makeListPastoralAgentsUseCase(c: DomainContext) {
  const daf = new D1PastoralAgentsDAF(c.env.DB);
  return new ListPastoralAgentsUseCase(daf);
}
