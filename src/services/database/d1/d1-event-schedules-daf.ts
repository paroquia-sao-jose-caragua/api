import type { EventSchedule } from '@/entities/event-schedule';
import type { EventSchedulesDAF } from '../event-schedules-daf';

export class D1EventSchedulesDAF implements EventSchedulesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(id: string) {
    const eventSchedule = await this.d1
      .prepare(
        `SELECT
          id,
          community_id as communityId,
          title,
          type,
          mass_type as massType,
          is_precept as isPrecept,
          event_date as eventDate,
          start_time as startTime,
          end_time as endTime,
          custom_location as customLocation,
          orientations,
          created_at as createdAt,
          updated_at as updatedAt
        FROM event_schedules WHERE id = ?`,
      )
      .bind(id)
      .first<{
        id: string;
        communityId: string;
        title: string | null;
        type: EventSchedule['type'];
        massType: EventSchedule['massType'] | null;
        isPrecept: boolean | null;
        eventDate: string;
        startTime: string;
        endTime: string | null;
        customLocation: string | null;
        orientations: string | null;
        createdAt: string;
        updatedAt: string | null;
      }>();

    if (!eventSchedule) {
      return null;
    }

    return {
      id: eventSchedule.id,
      communityId: eventSchedule.communityId,
      title: eventSchedule.title ?? undefined,
      type: eventSchedule.type,
      massType: eventSchedule.massType ?? undefined,
      isPrecept: eventSchedule.isPrecept ?? undefined,
      eventDate: eventSchedule.eventDate,
      startTime: eventSchedule.startTime,
      endTime: eventSchedule.endTime ?? undefined,
      customLocation: eventSchedule.customLocation ?? undefined,
      orientations: eventSchedule.orientations ?? undefined,
      createdAt: eventSchedule.createdAt,
      updatedAt: eventSchedule.updatedAt ?? undefined,
    };
  }

  async findMany(data: { from: string; to: string }): Promise<EventSchedule[]> {
    const eventSchedules = await this.d1
      .prepare(
        `SELECT
          id,
          community_id as communityId,
          title,
          type,
          mass_type as massType,
          is_precept as isPrecept,
          event_date as eventDate,
          start_time as startTime,
          end_time as endTime,
          custom_location as customLocation,
          orientations,
          created_at as createdAt,
          updated_at as updatedAt
        FROM event_schedules WHERE event_date BETWEEN ? AND ? ORDER BY event_date, start_time`,
      )
      .bind(data.from, data.to)
      .all<{
        id: string;
        communityId: string;
        title: string | null;
        type: EventSchedule['type'];
        massType: EventSchedule['massType'] | null;
        isPrecept: boolean | null;
        eventDate: string;
        startTime: string;
        endTime: string | null;
        customLocation: string | null;
        orientations: string | null;
        createdAt: string;
        updatedAt: string | null;
      }>();

    return eventSchedules.results.map((eventSchedule) => ({
      id: eventSchedule.id,
      communityId: eventSchedule.communityId,
      title: eventSchedule.title ?? undefined,
      type: eventSchedule.type,
      massType: eventSchedule.massType ?? undefined,
      isPrecept: eventSchedule.isPrecept ?? undefined,
      eventDate: eventSchedule.eventDate,
      startTime: eventSchedule.startTime,
      endTime: eventSchedule.endTime ?? undefined,
      customLocation: eventSchedule.customLocation ?? undefined,
      orientations: eventSchedule.orientations ?? undefined,
      createdAt: eventSchedule.createdAt,
      updatedAt: eventSchedule.updatedAt ?? undefined,
    }));
  }

  async create({
    id,
    communityId,
    createdAt,
    eventDate,
    startTime,
    title,
    type,
    massType,
    isPrecept,
    customLocation,
    endTime,
    orientations,
    updatedAt,
  }: EventSchedule): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO event_schedules (
          id,
          community_id,
          title,
          type,
          mass_type,
          is_precept,
          event_date,
          start_time,
          end_time,
          custom_location,
          orientations,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        communityId,
        title ?? null,
        type,
        massType ?? null,
        isPrecept ?? null,
        eventDate,
        startTime,
        endTime ?? null,
        customLocation ?? null,
        orientations ?? null,
        createdAt,
        updatedAt ?? null,
      )
      .run();
  }

  async update(eventSchedule: EventSchedule): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE event_schedules SET
          community_id = ?,
          title = ?,
          type = ?,
          mass_type = ?,
          is_precept = ?,
          event_date = ?,
          start_time = ?,
          end_time = ?,
          custom_location = ?,
          orientations = ?,
          created_at = ?,
          updated_at = ?
        WHERE id = ?`,
      )
      .bind(
        eventSchedule.communityId,
        eventSchedule.title ?? null,
        eventSchedule.type,
        eventSchedule.massType ?? null,
        eventSchedule.isPrecept ?? null,
        eventSchedule.eventDate,
        eventSchedule.startTime,
        eventSchedule.endTime ?? null,
        eventSchedule.customLocation ?? null,
        eventSchedule.orientations ?? null,
        eventSchedule.createdAt,
        eventSchedule.updatedAt ?? null,
        eventSchedule.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM event_schedules WHERE id = ?')
      .bind(id)
      .run();
  }
}
