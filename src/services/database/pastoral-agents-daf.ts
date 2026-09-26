import type { PastoralAgent } from '@/entities/pastoral-agent';

export interface PastoralAgentsDAF {
  listAll(filters?: { onlyActive?: boolean; serviceId?: string }): Promise<PastoralAgent[]>;
  findById(id: string): Promise<PastoralAgent | null>;
  findByUserId(userId: string): Promise<PastoralAgent | null>;
  save(agent: PastoralAgent, serviceIds?: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
