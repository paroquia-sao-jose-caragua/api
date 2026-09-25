import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { GetPastoralAgentUseCase } from '@/use-cases/appointments/get-pastoral-agent';
import { SavePastoralAgentUseCase } from '@/use-cases/appointments/save-pastoral-agent';
import { DeletePastoralAgentUseCase } from '@/use-cases/appointments/delete-pastoral-agent';

export function makeGetPastoralAgentUseCase(c: DomainContext) {
  const daf = new D1PastoralAgentsDAF(c.env.DB);
  return new GetPastoralAgentUseCase(daf);
}

export function makeSavePastoralAgentUseCase(c: DomainContext) {
  const daf = new D1PastoralAgentsDAF(c.env.DB);
  return new SavePastoralAgentUseCase(daf);
}

export function makeDeletePastoralAgentUseCase(c: DomainContext) {
  const daf = new D1PastoralAgentsDAF(c.env.DB);
  return new DeletePastoralAgentUseCase(daf);
}
