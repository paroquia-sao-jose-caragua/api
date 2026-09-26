import type { Announcement } from '@/entities/announcement';
import type { AnnouncementsDAF } from '../announcements-daf';

type AnnouncementRow = {
  id: string;
  badge_text: string | null;
  title: string;
  description: string;
  action_text: string | null;
  action_url: string | null;
  cover_desktop_id: string;
  cover_tablet_id: string | null;
  cover_mobile_id: string | null;
  sort_order: number;
  active: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export class D1AnnouncementsDAF implements AnnouncementsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: AnnouncementRow): Announcement {
    return {
      id: row.id,
      badgeText: row.badge_text,
      title: row.title,
      description: row.description,
      actionText: row.action_text,
      actionUrl: row.action_url,
      coverDesktopId: row.cover_desktop_id,
      coverTabletId: row.cover_tablet_id,
      coverMobileId: row.cover_mobile_id,
      sortOrder: row.sort_order,
      active: Boolean(row.active),
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Announcement | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, badge_text, title, description, action_text, action_url,
                cover_desktop_id, cover_tablet_id, cover_mobile_id,
                sort_order, active, starts_at, ends_at, created_at, updated_at
         FROM announcements 
         WHERE id = ?`,
      )
      .bind(id)
      .first<AnnouncementRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<Announcement[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT id, badge_text, title, description, action_text, action_url,
                cover_desktop_id, cover_tablet_id, cover_mobile_id,
                sort_order, active, starts_at, ends_at, created_at, updated_at
         FROM announcements
         ORDER BY sort_order ASC, created_at DESC`,
      )
      .all<AnnouncementRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findActive(): Promise<Announcement[]> {
    const now = new Date().toISOString();
    const { results } = await this.d1
      .prepare(
        `SELECT id, badge_text, title, description, action_text, action_url,
                cover_desktop_id, cover_tablet_id, cover_mobile_id,
                sort_order, active, starts_at, ends_at, created_at, updated_at
         FROM announcements
         WHERE active = 1
           AND (starts_at IS NULL OR starts_at <= ?)
           AND (ends_at IS NULL OR ends_at >= ?)
         ORDER BY sort_order ASC, created_at DESC`,
      )
      .bind(now, now)
      .all<AnnouncementRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async create(announcement: Announcement): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO announcements 
         (id, badge_text, title, description, action_text, action_url,
          cover_desktop_id, cover_tablet_id, cover_mobile_id,
          sort_order, active, starts_at, ends_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        announcement.id,
        announcement.badgeText ?? null,
        announcement.title,
        announcement.description,
        announcement.actionText ?? null,
        announcement.actionUrl ?? null,
        announcement.coverDesktopId,
        announcement.coverTabletId ?? null,
        announcement.coverMobileId ?? null,
        announcement.sortOrder,
        announcement.active ? 1 : 0,
        announcement.startsAt ?? null,
        announcement.endsAt ?? null,
        announcement.createdAt,
      )
      .run();
  }

  async save(announcement: Announcement): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE announcements 
         SET badge_text = ?, title = ?, description = ?, action_text = ?, action_url = ?,
             cover_desktop_id = ?, cover_tablet_id = ?, cover_mobile_id = ?,
             sort_order = ?, active = ?, starts_at = ?, ends_at = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        announcement.badgeText ?? null,
        announcement.title,
        announcement.description,
        announcement.actionText ?? null,
        announcement.actionUrl ?? null,
        announcement.coverDesktopId,
        announcement.coverTabletId ?? null,
        announcement.coverMobileId ?? null,
        announcement.sortOrder,
        announcement.active ? 1 : 0,
        announcement.startsAt ?? null,
        announcement.endsAt ?? null,
        announcement.updatedAt ?? new Date().toISOString(),
        announcement.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run();
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const statements = orderedIds.map((id, index) =>
      this.d1
        .prepare('UPDATE announcements SET sort_order = ?, updated_at = ? WHERE id = ?')
        .bind(index, new Date().toISOString(), id),
    );

    if (statements.length > 0) {
      await this.d1.batch(statements);
    }
  }
}
