import type { Appointment, AppointmentStatus, PatientConditions } from '@/entities/appointment';
import type { AppointmentsDAF, AppointmentsFilters } from '../appointments-daf';
import type { AppointmentServiceCategory } from '@/entities/appointment-service';

interface AppointmentRow {
  id: string;
  agent_id: string;
  service_id: string;
  community_id: string | null;
  requester_name: string;
  requester_phone: string;
  requester_email: string | null;
  requester_relationship: string | null;
  patient_name: string | null;
  patient_address: string | null;
  patient_conditions: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  access_token: string;
  requester_notes: string | null;
  private_pastoral_notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string | null;

  // Joined fields
  service_title?: string | null;
  service_category?: string | null;
  service_description?: string | null;
  service_duration?: number | null;
  service_requires_address?: number | null;
  agent_name?: string | null;
  agent_title?: string | null;
  agent_role?: string | null;
  agent_phone?: string | null;
  agent_email?: string | null;
  agent_photo_id?: string | null;
  community_name?: string | null;
}

export class D1AppointmentsDAF implements AppointmentsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: AppointmentRow): Appointment {
    let patientConditions: PatientConditions | null = null;
    if (row.patient_conditions) {
      try {
        patientConditions = JSON.parse(row.patient_conditions);
      } catch {
        patientConditions = null;
      }
    }

    return {
      id: row.id,
      agentId: row.agent_id,
      serviceId: row.service_id,
      communityId: row.community_id,
      requesterName: row.requester_name,
      requesterPhone: row.requester_phone,
      requesterEmail: row.requester_email,
      requesterRelationship: row.requester_relationship,
      patientName: row.patient_name,
      patientAddress: row.patient_address,
      patientConditions,
      appointmentDate: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as AppointmentStatus,
      accessToken: row.access_token,
      requesterNotes: row.requester_notes,
      privatePastoralNotes: row.private_pastoral_notes,
      cancellationReason: row.cancellation_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      service: row.service_title
        ? {
            id: row.service_id,
            title: row.service_title,
            category: (row.service_category || 'clergy_sacramental') as AppointmentServiceCategory,
            description: row.service_description || null,
            defaultDurationMinutes: row.service_duration || 30,
            requiresAddress: Boolean(row.service_requires_address),
            active: true,
          }
        : null,
      agent: row.agent_name
        ? {
            id: row.agent_id,
            name: row.agent_name,
            title: row.agent_title || null,
            actingRole: row.agent_role || '',
            userId: null,
            phone: row.agent_phone || '',
            email: row.agent_email || null,
            communityId: row.community_id,
            photoId: row.agent_photo_id || null,
            acceptsAppointments: true,
            active: true,
          }
        : null,
      community: row.community_id
        ? {
            id: row.community_id,
            name: row.community_name || '',
          }
        : null,
    };
  }

  private getBaseSelectQuery(): string {
    return `
      SELECT 
        a.*,
        s.title as service_title,
        s.category as service_category,
        s.description as service_description,
        s.default_duration_minutes as service_duration,
        s.requires_address as service_requires_address,
        ag.name as agent_name,
        ag.title as agent_title,
        ag.acting_role as agent_role,
        ag.phone as agent_phone,
        ag.email as agent_email,
        ag.photo_id as agent_photo_id,
        c.name as community_name
      FROM appointments a
      LEFT JOIN appointment_services s ON s.id = a.service_id
      LEFT JOIN pastoral_agents ag ON ag.id = a.agent_id
      LEFT JOIN communities c ON c.id = a.community_id
    `;
  }

  async create(appointment: Appointment): Promise<void> {
    const now = new Date().toISOString();
    await this.d1
      .prepare(`
        INSERT INTO appointments (
          id, agent_id, service_id, community_id,
          requester_name, requester_phone, requester_email, requester_relationship,
          patient_name, patient_address, patient_conditions,
          appointment_date, start_time, end_time,
          status, access_token, requester_notes, private_pastoral_notes, cancellation_reason,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        appointment.id,
        appointment.agentId,
        appointment.serviceId,
        appointment.communityId,
        appointment.requesterName,
        appointment.requesterPhone,
        appointment.requesterEmail,
        appointment.requesterRelationship,
        appointment.patientName,
        appointment.patientAddress,
        appointment.patientConditions ? JSON.stringify(appointment.patientConditions) : null,
        appointment.appointmentDate,
        appointment.startTime,
        appointment.endTime,
        appointment.status,
        appointment.accessToken,
        appointment.requesterNotes,
        appointment.privatePastoralNotes,
        appointment.cancellationReason,
        appointment.createdAt || now,
        appointment.updatedAt || now
      )
      .run();
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.d1
      .prepare(`${this.getBaseSelectQuery()} WHERE a.id = ?`)
      .bind(id)
      .first<AppointmentRow>();

    return row ? this.mapRowToEntity(row) : null;
  }

  async findByToken(token: string): Promise<Appointment | null> {
    const row = await this.d1
      .prepare(`${this.getBaseSelectQuery()} WHERE a.access_token = ?`)
      .bind(token)
      .first<AppointmentRow>();

    return row ? this.mapRowToEntity(row) : null;
  }

  async list(filters?: AppointmentsFilters): Promise<Appointment[]> {
    let sql = this.getBaseSelectQuery();
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (filters?.agentId) {
      conditions.push('a.agent_id = ?');
      bindings.push(filters.agentId);
    }
    if (filters?.date) {
      conditions.push('a.appointment_date = ?');
      bindings.push(filters.date);
    }
    if (filters?.startDate) {
      conditions.push('a.appointment_date >= ?');
      bindings.push(filters.startDate);
    }
    if (filters?.endDate) {
      conditions.push('a.appointment_date <= ?');
      bindings.push(filters.endDate);
    }
    if (filters?.status) {
      conditions.push('a.status = ?');
      bindings.push(filters.status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY a.appointment_date ASC, a.start_time ASC';

    const stmt = this.d1.prepare(sql);
    const { results } = bindings.length > 0
      ? await stmt.bind(...bindings).all<AppointmentRow>()
      : await stmt.all<AppointmentRow>();

    return results ? results.map((r) => this.mapRowToEntity(r)) : [];
  }

  async countBySlot(agentId: string, date: string, startTime: string): Promise<number> {
    const res = await this.d1
      .prepare(`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE agent_id = ? 
          AND appointment_date = ? 
          AND start_time = ? 
          AND status != 'cancelled'
      `)
      .bind(agentId, date, startTime)
      .first<{ count: number }>();

    return res?.count || 0;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string | null,
    privateNotes?: string | null
  ): Promise<void> {
    const now = new Date().toISOString();
    let sql = 'UPDATE appointments SET status = ?, updated_at = ?';
    const bindings: any[] = [status, now];

    if (cancellationReason !== undefined) {
      sql += ', cancellation_reason = ?';
      bindings.push(cancellationReason);
    }

    if (privateNotes !== undefined) {
      sql += ', private_pastoral_notes = ?';
      bindings.push(privateNotes);
    }

    sql += ' WHERE id = ?';
    bindings.push(id);

    await this.d1.prepare(sql).bind(...bindings).run();
  }

  async cancelByToken(token: string, cancellationReason: string): Promise<void> {
    const now = new Date().toISOString();
    await this.d1
      .prepare(`
        UPDATE appointments 
        SET status = 'cancelled', cancellation_reason = ?, updated_at = ? 
        WHERE access_token = ? AND status != 'completed'
      `)
      .bind(cancellationReason, now, token)
      .run();
  }
}
