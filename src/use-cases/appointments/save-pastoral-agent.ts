import { ulid } from 'serverless-crypto-utils/id-generation';
import type { PastoralAgent } from '@/entities/pastoral-agent';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';

interface SavePastoralAgentUseCaseRequest {
  id?: string;
  name: string;
  title?: string | null;
  actingRole: string;
  userId?: string | null;
  phone: string;
  email?: string | null;
  communityId?: string | null;
  photoId?: string | null;
  acceptsAppointments?: boolean;
  active?: boolean;
  serviceIds?: string[];
}

interface SavePastoralAgentUseCaseResponse {
  agent: PastoralAgent;
}

export class SavePastoralAgentUseCase {
  constructor(private pastoralAgentsDAF: PastoralAgentsDAF) {}

  async execute({
    id,
    name,
    title,
    actingRole,
    userId,
    phone,
    email,
    communityId,
    photoId,
    acceptsAppointments = true,
    active = true,
    serviceIds,
  }: SavePastoralAgentUseCaseRequest): Promise<SavePastoralAgentUseCaseResponse> {
    const agentId = id || ulid();

    const agent: PastoralAgent = {
      id: agentId,
      name: name.trim(),
      title: title?.trim() || null,
      actingRole: actingRole.trim(),
      userId: userId || null,
      phone: phone.trim(),
      email: email?.trim() || null,
      communityId: communityId || null,
      photoId: photoId || null,
      acceptsAppointments,
      active,
    };

    await this.pastoralAgentsDAF.save(agent, serviceIds);
    const savedAgent = await this.pastoralAgentsDAF.findById(agentId);

    return { agent: savedAgent || agent };
  }
}
