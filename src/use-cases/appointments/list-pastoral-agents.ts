import type { PastoralAgent } from '@/entities/pastoral-agent';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';

interface ListPastoralAgentsUseCaseRequest {
  onlyActive?: boolean;
  serviceId?: string;
}

interface ListPastoralAgentsUseCaseResponse {
  agents: PastoralAgent[];
}

export class ListPastoralAgentsUseCase {
  constructor(private pastoralAgentsDAF: PastoralAgentsDAF) {}

  async execute({
    onlyActive = true,
    serviceId,
  }: ListPastoralAgentsUseCaseRequest = {}): Promise<ListPastoralAgentsUseCaseResponse> {
    const agents = await this.pastoralAgentsDAF.listAll({
      onlyActive,
      serviceId,
    });

    return { agents };
  }
}
