import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';

interface DeletePastoralAgentUseCaseRequest {
  id: string;
}

export class DeletePastoralAgentUseCase {
  constructor(private pastoralAgentsDAF: PastoralAgentsDAF) {}

  async execute({ id }: DeletePastoralAgentUseCaseRequest): Promise<void> {
    const agent = await this.pastoralAgentsDAF.findById(id);
    if (!agent) {
      throw new PastoralAgentNotFoundError();
    }

    await this.pastoralAgentsDAF.delete(id);
  }
}
