import { ulid } from 'serverless-crypto-utils/id-generation';
import type { AgentAvailability, AgentBlockedDate } from '@/entities/agent-availability';
import type { AgentAvailabilitiesDAF } from '@/services/database/agent-availabilities-daf';

export class ManageAgentAvailabilitiesUseCase {
  constructor(private agentAvailabilitiesDAF: AgentAvailabilitiesDAF) {}

  async listAvailabilities(agentId: string): Promise<AgentAvailability[]> {
    return this.agentAvailabilitiesDAF.listByAgentId(agentId, false);
  }

  async saveAvailabilities(
    agentId: string,
    availabilities: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      communityId?: string | null;
      slotDurationMinutes?: number;
      active?: boolean;
    }>
  ): Promise<void> {
    const list: AgentAvailability[] = availabilities.map((a) => ({
      id: ulid(),
      agentId,
      communityId: a.communityId || null,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      slotDurationMinutes: a.slotDurationMinutes || 30,
      active: a.active !== false,
    }));

    await this.agentAvailabilitiesDAF.saveAvailabilities(agentId, list);
  }

  async listBlockedDates(agentId: string): Promise<AgentBlockedDate[]> {
    return this.agentAvailabilitiesDAF.listBlockedDates(agentId);
  }

  async addBlockedDate(
    agentId: string,
    blockedDate: string,
    startTime?: string | null,
    endTime?: string | null,
    reason?: string | null
  ): Promise<AgentBlockedDate> {
    const item: AgentBlockedDate = {
      id: ulid(),
      agentId,
      blockedDate,
      startTime: startTime || null,
      endTime: endTime || null,
      reason: reason || null,
    };

    await this.agentAvailabilitiesDAF.addBlockedDate(item);
    return item;
  }

  async removeBlockedDate(id: string): Promise<void> {
    await this.agentAvailabilitiesDAF.removeBlockedDate(id);
  }
}
