import type { AppointmentService, AppointmentServiceCategory } from '@/entities/appointment-service';
import type { AppointmentServicesDAF } from '../appointment-services-daf';

interface AppointmentServiceRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  default_duration_minutes: number;
  requires_address: number;
  active: number;
  created_at: string;
}

export class D1AppointmentServicesDAF implements AppointmentServicesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: AppointmentServiceRow): AppointmentService {
    return {
      id: row.id,
      title: row.title,
      category: row.category as AppointmentServiceCategory,
      description: row.description,
      defaultDurationMinutes: row.default_duration_minutes,
      requiresAddress: Boolean(row.requires_address),
      active: Boolean(row.active),
      createdAt: row.created_at,
    };
  }

  async listAll(onlyActive = true): Promise<AppointmentService[]> {
    let sql = 'SELECT * FROM appointment_services';
    if (onlyActive) {
      sql += ' WHERE active = 1';
    }
    sql += ` ORDER BY 
      CASE 
        WHEN title LIKE '%Confissão%' THEN 1
        WHEN title LIKE '%Direção Espiritual%' THEN 2
        WHEN title LIKE '%Aconselhamento%' THEN 3
        WHEN category = 'home_visit' THEN 4
        ELSE 5
      END, title ASC`;

    const { results } = await this.d1.prepare(sql).all<AppointmentServiceRow>();
    return results ? results.map((row) => this.mapRowToEntity(row)) : [];
  }

  async findById(id: string): Promise<AppointmentService | null> {
    const row = await this.d1
      .prepare('SELECT * FROM appointment_services WHERE id = ?')
      .bind(id)
      .first<AppointmentServiceRow>();

    return row ? this.mapRowToEntity(row) : null;
  }

  async save(service: AppointmentService): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO appointment_services (
          id, title, category, description, default_duration_minutes, requires_address, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          category = excluded.category,
          description = excluded.description,
          default_duration_minutes = excluded.default_duration_minutes,
          requires_address = excluded.requires_address,
          active = excluded.active`
      )
      .bind(
        service.id,
        service.title,
        service.category,
        service.description,
        service.defaultDurationMinutes,
        service.requiresAddress ? 1 : 0,
        service.active ? 1 : 0,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM appointment_services WHERE id = ?').bind(id).run();
  }
}

