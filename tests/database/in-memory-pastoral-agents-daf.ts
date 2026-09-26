import type { PastoralAgent } from '@/entities/pastoral-agent';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';

export class InMemoryPastoralAgentsDAF implements PastoralAgentsDAF {
  public items: PastoralAgent[] = [];
  public agentServicesMap = new Map<string, string[]>();

  async listAll(filters?: {
    onlyActive?: boolean;
    serviceId?: string;
  }): Promise<PastoralAgent[]> {
    return this.items.filter((agent) => {
      if (filters?.onlyActive !== false && (!agent.active || !agent.acceptsAppointments)) {
        return false;
      }
      if (filters?.serviceId) {
        const services = this.agentServicesMap.get(agent.id) || [];
        if (!services.includes(filters.serviceId)) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id: string): Promise<PastoralAgent | null> {
    const agent = this.items.find((item) => item.id === id);
    return agent || null;
  }

  async findByUserId(userId: string): Promise<PastoralAgent | null> {
    const agent = this.items.find((item) => item.userId === userId);
    return agent || null;
  }

  async save(agent: PastoralAgent, serviceIds?: string[]): Promise<void> {
    const index = this.items.findIndex((item) => item.id === agent.id);
    if (index >= 0) {
      this.items[index] = agent;
    } else {
      this.items.push(agent);
    }

    if (serviceIds !== undefined) {
      this.agentServicesMap.set(agent.id, serviceIds);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
    this.agentServicesMap.delete(id);
  }
}
