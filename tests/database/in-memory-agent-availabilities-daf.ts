import type { AgentAvailability, AgentBlockedDate } from '@/entities/agent-availability';
import type { AgentAvailabilitiesDAF } from '@/services/database/agent-availabilities-daf';

export class InMemoryAgentAvailabilitiesDAF implements AgentAvailabilitiesDAF {
  public availabilities: AgentAvailability[] = [];
  public blockedDates: AgentBlockedDate[] = [];

  async listByAgentId(agentId: string, onlyActive = true): Promise<AgentAvailability[]> {
    return this.availabilities.filter((a) => {
      if (a.agentId !== agentId) return false;
      if (onlyActive && !a.active) return false;
      return true;
    });
  }

  async listByAgentAndDay(agentId: string, dayOfWeek: number): Promise<AgentAvailability[]> {
    return this.availabilities.filter(
      (a) => a.agentId === agentId && a.dayOfWeek === dayOfWeek && a.active
    );
  }

  async saveAvailabilities(agentId: string, availabilities: AgentAvailability[]): Promise<void> {
    this.availabilities = this.availabilities.filter((a) => a.agentId !== agentId);
    this.availabilities.push(...availabilities);
  }

  async listBlockedDates(
    agentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AgentBlockedDate[]> {
    return this.blockedDates.filter((b) => {
      if (b.agentId !== agentId) return false;
      if (startDate && b.blockedDate < startDate) return false;
      if (endDate && b.blockedDate > endDate) return false;
      return true;
    });
  }

  async addBlockedDate(blockedDate: AgentBlockedDate): Promise<void> {
    this.blockedDates.push(blockedDate);
  }

  async removeBlockedDate(id: string): Promise<void> {
    this.blockedDates = this.blockedDates.filter((b) => b.id !== id);
  }
}
