import type { PastoralAgent } from '@/entities/pastoral-agent';
import type { AppointmentService, AppointmentServiceCategory } from '@/entities/appointment-service';
import type { PastoralAgentsDAF } from '../pastoral-agents-daf';

interface PastoralAgentRow {
  id: string;
  name: string;
  title: string | null;
  acting_role: string;
  user_id: string | null;
  phone: string;
  email: string | null;
  community_id: string | null;
  photo_id: string | null;
  accepts_appointments: number;
  active: number;
  created_at: string;
  updated_at: string | null;
  community_name: string | null;
}

interface ServiceRow {
  agent_id: string;
  id: string;
  title: string;
  category: string;
  description: string | null;
  default_duration_minutes: number;
  requires_address: number;
  active: number;
}

export class D1PastoralAgentsDAF implements PastoralAgentsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(
    row: PastoralAgentRow,
    services: AppointmentService[] = []
  ): PastoralAgent {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      actingRole: row.acting_role,
      userId: row.user_id,
      phone: row.phone,
      email: row.email,
      communityId: row.community_id,
      photoId: row.photo_id,
      acceptsAppointments: Boolean(row.accepts_appointments),
      active: Boolean(row.active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      community: row.community_id
        ? {
            id: row.community_id,
            name: row.community_name || '',
          }
        : null,
      services,
    };
  }

  async listAll(filters?: {
    onlyActive?: boolean;
    serviceId?: string;
  }): Promise<PastoralAgent[]> {
    let sql = `
      SELECT 
        pa.*,
        c.name as community_name
      FROM pastoral_agents pa
      LEFT JOIN communities c ON c.id = pa.community_id
    `;
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (filters?.onlyActive !== false) {
      conditions.push('pa.active = 1 AND pa.accepts_appointments = 1');
    }

    if (filters?.serviceId) {
      conditions.push(
        'EXISTS (SELECT 1 FROM agent_services ags WHERE ags.agent_id = pa.id AND ags.service_id = ?)'
      );
      bindings.push(filters.serviceId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY pa.name ASC';

    const stmt = this.d1.prepare(sql);
    const { results } = bindings.length > 0
      ? await stmt.bind(...bindings).all<PastoralAgentRow>()
      : await stmt.all<PastoralAgentRow>();

    if (!results || results.length === 0) {
      return [];
    }

    // Load services for all agents
    const agentIds = results.map((r) => r.id);
    const placeholders = agentIds.map(() => '?').join(',');
    const servicesStmt = this.d1.prepare(`
      SELECT 
        ags.agent_id,
        s.id,
        s.title,
        s.category,
        s.description,
        s.default_duration_minutes,
        s.requires_address,
        s.active
      FROM agent_services ags
      JOIN appointment_services s ON s.id = ags.service_id
      WHERE ags.agent_id IN (${placeholders})
    `);

    const { results: serviceRows } = await servicesStmt
      .bind(...agentIds)
      .all<ServiceRow>();

    const servicesByAgent = new Map<string, AppointmentService[]>();
    for (const sRow of serviceRows || []) {
      const list = servicesByAgent.get(sRow.agent_id) || [];
      list.push({
        id: sRow.id,
        title: sRow.title,
        category: sRow.category as AppointmentServiceCategory,
        description: sRow.description,
        defaultDurationMinutes: sRow.default_duration_minutes,
        requiresAddress: Boolean(sRow.requires_address),
        active: Boolean(sRow.active),
      });
      servicesByAgent.set(sRow.agent_id, list);
    }

    return results.map((row) =>
      this.mapRowToEntity(row, servicesByAgent.get(row.id) || [])
    );
  }

  async findById(id: string): Promise<PastoralAgent | null> {
    const row = await this.d1
      .prepare(`
        SELECT 
          pa.*,
          c.name as community_name
        FROM pastoral_agents pa
        LEFT JOIN communities c ON c.id = pa.community_id
        WHERE pa.id = ?
      `)
      .bind(id)
      .first<PastoralAgentRow>();

    if (!row) return null;

    const { results: serviceRows } = await this.d1
      .prepare(`
        SELECT 
          ags.agent_id,
          s.id,
          s.title,
          s.category,
          s.description,
          s.default_duration_minutes,
          s.requires_address,
          s.active
        FROM agent_services ags
        JOIN appointment_services s ON s.id = ags.service_id
        WHERE ags.agent_id = ?
      `)
      .bind(id)
      .all<ServiceRow>();

    const services: AppointmentService[] = (serviceRows || []).map((sRow) => ({
      id: sRow.id,
      title: sRow.title,
      category: sRow.category as AppointmentServiceCategory,
      description: sRow.description,
      defaultDurationMinutes: sRow.default_duration_minutes,
      requiresAddress: Boolean(sRow.requires_address),
      active: Boolean(sRow.active),
    }));

    return this.mapRowToEntity(row, services);
  }

  async findByUserId(userId: string): Promise<PastoralAgent | null> {
    const row = await this.d1
      .prepare(`
        SELECT 
          pa.*,
          c.name as community_name
        FROM pastoral_agents pa
        LEFT JOIN communities c ON c.id = pa.community_id
        WHERE pa.user_id = ?
      `)
      .bind(userId)
      .first<PastoralAgentRow>();

    if (!row) return null;
    return this.findById(row.id);
  }

  async save(agent: PastoralAgent, serviceIds?: string[]): Promise<void> {
    const now = new Date().toISOString();
    await this.d1
      .prepare(`
        INSERT INTO pastoral_agents (
          id, name, title, acting_role, user_id, phone, email,
          community_id, photo_id, accepts_appointments, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          title = excluded.title,
          acting_role = excluded.acting_role,
          user_id = excluded.user_id,
          phone = excluded.phone,
          email = excluded.email,
          community_id = excluded.community_id,
          photo_id = excluded.photo_id,
          accepts_appointments = excluded.accepts_appointments,
          active = excluded.active,
          updated_at = excluded.updated_at
      `)
      .bind(
        agent.id,
        agent.name,
        agent.title,
        agent.actingRole,
        agent.userId,
        agent.phone,
        agent.email,
        agent.communityId,
        agent.photoId,
        agent.acceptsAppointments ? 1 : 0,
        agent.active ? 1 : 0,
        agent.createdAt || now,
        now,
      )
      .run();

    if (serviceIds !== undefined) {
      await this.d1
        .prepare('DELETE FROM agent_services WHERE agent_id = ?')
        .bind(agent.id)
        .run();

      for (const sId of serviceIds) {
        await this.d1
          .prepare(
            'INSERT INTO agent_services (agent_id, service_id) VALUES (?, ?) ON CONFLICT DO NOTHING'
          )
          .bind(agent.id, sId)
          .run();
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM pastoral_agents WHERE id = ?').bind(id).run();
  }
}
