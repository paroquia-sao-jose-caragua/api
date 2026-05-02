import type { MassSchedule } from '@/entities/mass-schedule';
import type { MassSchedulesDAF } from '../mass-schedules-daf';

export class D1MassSchedulesDAF implements MassSchedulesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(massScheduleId: string): Promise<MassSchedule | null> {
    const massScheduleRow = await this.d1
      .prepare('SELECT * FROM mass_schedules WHERE id = ?')
      .bind(massScheduleId)
      .first<{
        id: string;
        community_id: string;
        title: string;
        type: MassSchedule['type'];
        orientations: string;
        is_precept: boolean;
        recurrence_type: MassSchedule['recurrenceType'];
        day_of_week: number | null;
        day_of_month: number | null;
        week_of_month: number | null;
        month_of_year: number | null;
        active: boolean;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        updated_at: string;
      }>();

    if (!massScheduleRow) {
      return null;
    }

    const timesRows = await this.d1
      .prepare('SELECT * FROM mass_schedule_times WHERE schedule_id = ?')
      .bind(massScheduleId)
      .all<{
        id: string;
        schedule_id: string;
        start_time: string;
        end_time: string;
      }>();

    const times = timesRows.results.map((row) => ({
      id: row.id,
      scheduleId: row.schedule_id,
      startTime: row.start_time,
      endTime: row.end_time,
    }));

    return {
      id: massScheduleRow.id,
      communityId: massScheduleRow.community_id,
      title: massScheduleRow.title,
      type: massScheduleRow.type,
      orientations: massScheduleRow.orientations,
      isPrecept: massScheduleRow.is_precept,
      recurrenceType: massScheduleRow.recurrence_type,
      dayOfWeek: massScheduleRow.day_of_week ?? undefined,
      dayOfMonth: massScheduleRow.day_of_month ?? undefined,
      weekOfMonth: massScheduleRow.week_of_month ?? undefined,
      monthOfYear: massScheduleRow.month_of_year ?? undefined,
      active: massScheduleRow.active,
      startDate: massScheduleRow.start_date ?? undefined,
      endDate: massScheduleRow.end_date ?? undefined,
      createdAt: massScheduleRow.created_at,
      updatedAt: massScheduleRow.updated_at,
      times,
    };
  }

  async findMany({
    communityId,
  }: {
    communityId: string;
  }): Promise<MassSchedule[]> {
    const massSchedules = await this.d1
      .prepare(
        `
        SELECT 
          id, community_id, title, type, orientations, is_precept, recurrence_type,
          day_of_week, day_of_month, week_of_month, month_of_year,
          active, start_date, end_date, created_at, updated_at,
          (
            SELECT ARRAY_AGG(JSON_OBJECT(
              'id', mst.id,
              'scheduleId', mst.schedule_id,
              'startTime', mst.start_time,
              'endTime', mst.end_time
            ))
            FROM mass_schedule_times mst
            WHERE mst.schedule_id = ms.id
          ) as times
        FROM mass_schedules
        WHERE community_id = ?`,
      )
      .bind(communityId)
      .all<{
        id: string;
        community_id: string;
        title: string;
        type: MassSchedule['type'];
        orientations: string;
        is_precept: boolean;
        recurrence_type: MassSchedule['recurrenceType'];
        day_of_week: number | null;
        day_of_month: number | null;
        week_of_month: number | null;
        month_of_year: number | null;
        active: boolean;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        updated_at: string;
        times:
          | {
              id: string;
              scheduleId: string;
              startTime: string;
              endTime: string;
            }[]
          | null;
      }>();

    return massSchedules.results.map((row) => ({
      id: row.id,
      communityId: row.community_id,
      title: row.title,
      type: row.type,
      orientations: row.orientations,
      isPrecept: row.is_precept,
      recurrenceType: row.recurrence_type,
      dayOfWeek: row.day_of_week ?? undefined,
      dayOfMonth: row.day_of_month ?? undefined,
      weekOfMonth: row.week_of_month ?? undefined,
      monthOfYear: row.month_of_year ?? undefined,
      active: row.active,
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      times: row.times ?? [],
    }));
  }

  async findAll(): Promise<MassSchedule[]> {
    const massSchedules = await this.d1
      .prepare(
        `
        SELECT 
          id, community_id, title, type, orientations, is_precept, recurrence_type,
          day_of_week, day_of_month, week_of_month, month_of_year,
          active, start_date, end_date, created_at, updated_at,
          (
            SELECT ARRAY_AGG(JSON_OBJECT(
              'id', mst.id,
              'scheduleId', mst.schedule_id,
              'startTime', mst.start_time,
              'endTime', mst.end_time
            ))
            FROM mass_schedule_times mst
            WHERE mst.schedule_id = ms.id
          ) as times
        FROM mass_schedules`,
      )
      .all<{
        id: string;
        community_id: string;
        title: string;
        type: MassSchedule['type'];
        orientations: string;
        is_precept: boolean;
        recurrence_type: MassSchedule['recurrenceType'];
        day_of_week: number | null;
        day_of_month: number | null;
        week_of_month: number | null;
        month_of_year: number | null;
        active: boolean;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        updated_at: string;
        times:
          | {
              id: string;
              scheduleId: string;
              startTime: string;
              endTime: string;
            }[]
          | null;
      }>();

    return massSchedules.results.map((row) => ({
      id: row.id,
      communityId: row.community_id,
      title: row.title,
      type: row.type,
      orientations: row.orientations,
      isPrecept: row.is_precept,
      recurrenceType: row.recurrence_type,
      dayOfWeek: row.day_of_week ?? undefined,
      dayOfMonth: row.day_of_month ?? undefined,
      weekOfMonth: row.week_of_month ?? undefined,
      monthOfYear: row.month_of_year ?? undefined,
      active: row.active,
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      times: row.times ?? [],
    }));
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
    monthOfYear,
    active,
    startDate,
    endDate,
    createdAt,
    times,
  }: MassSchedule): Promise<void> {
    const queries = [];

    queries.push(
      this.d1
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
            month_of_year,
            active,
            start_date,
            end_date,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id`,
        )
        .bind(
          id,
          communityId,
          title ?? null,
          type,
          orientations ?? null,
          isPrecept,
          recurrenceType,
          dayOfWeek ?? null,
          dayOfMonth ?? null,
          weekOfMonth ?? null,
          monthOfYear ?? null,
          active ? 1 : 0,
          startDate ?? null,
          endDate ?? null,
          createdAt,
          createdAt, // updatedAt initially same as createdAt
        ),
    );

    for (const time of times) {
      queries.push(
        this.d1
          .prepare(
            'INSERT INTO mass_schedule_times (id, schedule_id, start_time, end_time) VALUES (?, ?, ?, ?)',
          )
          .bind(time.id, time.scheduleId, time.startTime, time.endTime),
      );
    }

    await this.d1.batch(queries);
  }

  async save(massSchedule: MassSchedule): Promise<void> {
    const queries = [];

    queries.push(
      this.d1
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
            month_of_year = ?,
            active = ?,
            start_date = ?,
            end_date = ?,
            updated_at = ?
          WHERE id = ?`,
        )
        .bind(
          massSchedule.communityId,
          massSchedule.title,
          massSchedule.type,
          massSchedule.orientations,
          massSchedule.isPrecept,
          massSchedule.recurrenceType,
          massSchedule.dayOfWeek ?? null,
          massSchedule.dayOfMonth ?? null,
          massSchedule.weekOfMonth ?? null,
          massSchedule.monthOfYear ?? null,
          massSchedule.active ? 1 : 0,
          massSchedule.startDate ?? null,
          massSchedule.endDate ?? null,
          massSchedule.updatedAt,
          massSchedule.id,
        ),
    );

    // Delete existing times
    queries.push(
      this.d1
        .prepare('DELETE FROM mass_schedule_times WHERE schedule_id = ?')
        .bind(massSchedule.id),
    );

    // Insert updated times
    for (const time of massSchedule.times) {
      queries.push(
        this.d1
          .prepare(
            'INSERT INTO mass_schedule_times (id, schedule_id, start_time, end_time) VALUES (?, ?, ?, ?)',
          )
          .bind(time.id, time.scheduleId, time.startTime, time.endTime),
      );
    }

    await this.d1.batch(queries);
  }

  async delete(massScheduleId: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM mass_schedules WHERE id = ?')
      .bind(massScheduleId)
      .run();
  }
}
