import type { AgentAvailability, AgentBlockedDate } from '@/entities/agent-availability';

export interface AgentAvailabilitiesDAF {
  listByAgentId(agentId: string, onlyActive?: boolean): Promise<AgentAvailability[]>;
  listByAgentAndDay(agentId: string, dayOfWeek: number): Promise<AgentAvailability[]>;
  saveAvailabilities(agentId: string, availabilities: AgentAvailability[]): Promise<void>;
  listBlockedDates(agentId: string, startDate?: string, endDate?: string): Promise<AgentBlockedDate[]>;
  addBlockedDate(blockedDate: AgentBlockedDate): Promise<void>;
  removeBlockedDate(id: string): Promise<void>;
}
