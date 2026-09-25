import type { AgentAvailability, AgentBlockedDate } from '@/entities/agent-availability';
import type { AgentAvailabilitiesDAF } from '../agent-availabilities-daf';

interface AvailabilityRow {
  id: string;
  agent_id: string;
  community_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  active: number;
}

interface BlockedDateRow {
  id: string;
  agent_id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export class D1AgentAvailabilitiesDAF implements AgentAvailabilitiesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapAvailabilityRow(row: AvailabilityRow): AgentAvailability {
    return {
      id: row.id,
      agentId: row.agent_id,
      communityId: row.community_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      slotDurationMinutes: row.slot_duration_minutes,
      active: Boolean(row.active),
    };
  }

  private mapBlockedDateRow(row: BlockedDateRow): AgentBlockedDate {
    return {
      id: row.id,
      agentId: row.agent_id,
      blockedDate: row.blocked_date,
      startTime: row.start_time,
      endTime: row.end_time,
      reason: row.reason,
    };
  }

  async listByAgentId(agentId: string, onlyActive = true): Promise<AgentAvailability[]> {
    let sql = 'SELECT * FROM agent_availabilities WHERE agent_id = ?';
    if (onlyActive) {
      sql += ' AND active = 1';
    }
    sql += ' ORDER BY day_of_week ASC, start_time ASC';

    const { results } = await this.d1
      .prepare(sql)
      .bind(agentId)
      .all<AvailabilityRow>();

    return results ? results.map((r) => this.mapAvailabilityRow(r)) : [];
  }

  async listByAgentAndDay(agentId: string, dayOfWeek: number): Promise<AgentAvailability[]> {
    const { results } = await this.d1
      .prepare(
        'SELECT * FROM agent_availabilities WHERE agent_id = ? AND day_of_week = ? AND active = 1 ORDER BY start_time ASC'
      )
      .bind(agentId, dayOfWeek)
      .all<AvailabilityRow>();

    return results ? results.map((r) => this.mapAvailabilityRow(r)) : [];
  }

  async saveAvailabilities(agentId: string, availabilities: AgentAvailability[]): Promise<void> {
    await this.d1
      .prepare('DELETE FROM agent_availabilities WHERE agent_id = ?')
      .bind(agentId)
      .run();

    for (const av of availabilities) {
      await this.d1
        .prepare(`
          INSERT INTO agent_availabilities (
            id, agent_id, community_id, day_of_week, start_time, end_time, slot_duration_minutes, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          av.id,
          agentId,
          av.communityId,
          av.dayOfWeek,
          av.startTime,
          av.endTime,
          av.slotDurationMinutes,
          av.active ? 1 : 0
        )
        .run();
    }
  }

  async listBlockedDates(
    agentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AgentBlockedDate[]> {
    let sql = 'SELECT * FROM agent_blocked_dates WHERE agent_id = ?';
    const bindings: any[] = [agentId];

    if (startDate) {
      sql += ' AND blocked_date >= ?';
      bindings.push(startDate);
    }
    if (endDate) {
      sql += ' AND blocked_date <= ?';
      bindings.push(endDate);
    }

    sql += ' ORDER BY blocked_date ASC';

    const { results } = await this.d1
      .prepare(sql)
      .bind(...bindings)
      .all<BlockedDateRow>();

    return results ? results.map((r) => this.mapBlockedDateRow(r)) : [];
  }

  async addBlockedDate(blockedDate: AgentBlockedDate): Promise<void> {
    await this.d1
      .prepare(`
        INSERT INTO agent_blocked_dates (
          id, agent_id, blocked_date, start_time, end_time, reason
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        blockedDate.id,
        blockedDate.agentId,
        blockedDate.blockedDate,
        blockedDate.startTime,
        blockedDate.endTime,
        blockedDate.reason
      )
      .run();
  }

  async removeBlockedDate(id: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM agent_blocked_dates WHERE id = ?')
      .bind(id)
      .run();
  }
}
