import type { MassSchedule } from '@/entities/mass-schedule';
import type { MassSchedulesDAF } from '../mass-schedules-daf';

type MassScheduleRow = {
  id: string;
  community_id: string;
  title: string | null;
  type: MassSchedule['type'];
  orientations: string | null;
  is_precept: number | boolean;
  recurrence_type: MassSchedule['recurrenceType'];
  day_of_week: number | null;
  day_of_month: number | null;
  week_of_month: number | null;
  month_of_year: number | null;
  active: number | boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string;
  created_at: string;
  updated_at: string | null;
};

function mapRowToMassSchedule(row: MassScheduleRow): MassSchedule {
  return {
    id: row.id,
    communityId: row.community_id,
    title: row.title ?? undefined,
    type: row.type,
    orientations: row.orientations ?? undefined,
    isPrecept: Boolean(row.is_precept),
    recurrenceType: row.recurrence_type,
    dayOfWeek: row.day_of_week ?? undefined,
    dayOfMonth: row.day_of_month ?? undefined,
    weekOfMonth: row.week_of_month ?? undefined,
    active: Boolean(row.active),
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    startTime: row.start_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

export class D1MassSchedulesDAF implements MassSchedulesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(massScheduleId: string): Promise<MassSchedule | null> {
    const row = await this.d1
      .prepare('SELECT * FROM mass_schedules WHERE id = ?')
      .bind(massScheduleId)
      .first<MassScheduleRow>();

    if (!row) {
      return null;
    }

    return mapRowToMassSchedule(row);
  }

  async findMany({
    communityId,
  }: {
    communityId: string;
  }): Promise<MassSchedule[]> {
    const rows = await this.d1
      .prepare(
        `SELECT 
          id, community_id, title, type, orientations, is_precept, recurrence_type,
          day_of_week, day_of_month, week_of_month, month_of_year,
          active, start_date, end_date, start_time, created_at, updated_at
        FROM mass_schedules
        WHERE community_id = ?`,
      )
      .bind(communityId)
      .all<MassScheduleRow>();

    if (!rows.results || rows.results.length === 0) {
      return [];
    }

    return rows.results.map(mapRowToMassSchedule);
  }

  async findAll(): Promise<MassSchedule[]> {
    const rows = await this.d1
      .prepare(
        `SELECT 
          id, community_id, title, type, orientations, is_precept, recurrence_type,
          day_of_week, day_of_month, week_of_month, month_of_year,
          active, start_date, end_date, start_time, created_at, updated_at
        FROM mass_schedules`,
      )
      .all<MassScheduleRow>();

    if (!rows.results || rows.results.length === 0) {
      return [];
    }

    return rows.results.map(mapRowToMassSchedule);
  }

  async create({
    id,
    communityId,
    title,
    type,
    orientations,
    isPrecept,
    recurrenceType,
    dayOfWeek,
    dayOfMonth,
    weekOfMonth,
    active,
    startDate,
    endDate,
    startTime,
    createdAt,
  }: MassSchedule): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO mass_schedules (
          id,
          community_id,
          title,
          type,
          orientations,
          is_precept,
          recurrence_type,
          day_of_week,
          day_of_month,
          week_of_month,
          active,
          start_date,
          end_date,
          start_time,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        communityId,
        title ?? null,
        type,
        orientations ?? null,
        isPrecept ? 1 : 0,
        recurrenceType,
        dayOfWeek ?? null,
        dayOfMonth ?? null,
        weekOfMonth ?? null,
        active ? 1 : 0,
        startDate ?? null,
        endDate ?? null,
        startTime,
        createdAt,
        createdAt,
      )
      .run();
  }

  async save(massSchedule: MassSchedule): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE mass_schedules SET
          community_id = ?,
          title = ?,
          type = ?,
          orientations = ?,
          is_precept = ?,
          recurrence_type = ?,
          day_of_week = ?,
          day_of_month = ?,
          week_of_month = ?,
          active = ?,
          start_date = ?,
          end_date = ?,
          start_time = ?,
          updated_at = ?
        WHERE id = ?`,
      )
      .bind(
        massSchedule.communityId,
        massSchedule.title ?? null,
        massSchedule.type,
        massSchedule.orientations ?? null,
        massSchedule.isPrecept ? 1 : 0,
        massSchedule.recurrenceType,
        massSchedule.dayOfWeek ?? null,
        massSchedule.dayOfMonth ?? null,
        massSchedule.weekOfMonth ?? null,
        massSchedule.active ? 1 : 0,
        massSchedule.startDate ?? null,
        massSchedule.endDate ?? null,
        massSchedule.startTime,
        massSchedule.updatedAt,
        massSchedule.id,
      )
      .run();
  }

  async delete(massScheduleId: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM mass_schedules WHERE id = ?')
      .bind(massScheduleId)
      .run();
  }
}
