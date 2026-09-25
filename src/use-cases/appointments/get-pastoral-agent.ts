import type { PastoralAgent } from '@/entities/pastoral-agent';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';

interface GetPastoralAgentUseCaseRequest {
  id: string;
}

interface GetPastoralAgentUseCaseResponse {
  agent: PastoralAgent;
}

export class GetPastoralAgentUseCase {
  constructor(private pastoralAgentsDAF: PastoralAgentsDAF) {}

  async execute({
    id,
  }: GetPastoralAgentUseCaseRequest): Promise<GetPastoralAgentUseCaseResponse> {
    const agent = await this.pastoralAgentsDAF.findById(id);

    if (!agent) {
      throw new PastoralAgentNotFoundError();
    }

    return { agent };
  }
}
