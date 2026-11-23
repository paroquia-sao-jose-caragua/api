import type { Notice, NoticeVariant } from '@/entities/notice';
import type { NoticesDAF } from '../notices-daf';

type NoticeRow = {
  id: string;
  title: string;
  summary: string | null;
  description: string;
  variant: NoticeVariant;
  image_id: string | null;
  action_text: string | null;
  action_url: string | null;
  pinned: number;
  active: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string | null;
};

const SELECT_NOTICE_FIELDS = `
  id, title, summary, description, variant, image_id, action_text, action_url,
  pinned, active, starts_at, ends_at, created_at, updated_at
`;

export class D1NoticesDAF implements NoticesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: NoticeRow): Notice {
    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      description: row.description,
      variant: row.variant || 'info',
      imageId: row.image_id,
      actionText: row.action_text,
      actionUrl: row.action_url,
      pinned: Boolean(row.pinned),
      active: Boolean(row.active),
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Notice | null> {
    const row = await this.d1
      .prepare(
        `SELECT ${SELECT_NOTICE_FIELDS}
         FROM notices
         WHERE id = ?`,
      )
      .bind(id)
      .first<NoticeRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<Notice[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT ${SELECT_NOTICE_FIELDS}
         FROM notices
         ORDER BY pinned DESC, created_at DESC`,
      )
      .all<NoticeRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findActive(): Promise<Notice[]> {
    const now = new Date().toISOString();
    const { results } = await this.d1
      .prepare(
        `SELECT ${SELECT_NOTICE_FIELDS}
         FROM notices
         WHERE active = 1
           AND (starts_at IS NULL OR starts_at <= ?)
           AND (ends_at IS NULL OR ends_at >= ?)
         ORDER BY pinned DESC, created_at DESC`,
      )
      .bind(now, now)
      .all<NoticeRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async create(notice: Notice): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO notices
         (id, title, summary, description, variant, image_id, action_text, action_url,
          pinned, active, starts_at, ends_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        notice.id,
        notice.title,
        notice.summary ?? null,
        notice.description,
        notice.variant,
        notice.imageId ?? null,
        notice.actionText ?? null,
        notice.actionUrl ?? null,
        notice.pinned ? 1 : 0,
        notice.active ? 1 : 0,
        notice.startsAt ?? null,
        notice.endsAt ?? null,
        notice.createdAt,
      )
      .run();
  }

  async save(notice: Notice): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE notices
         SET title = ?, summary = ?, description = ?, variant = ?, image_id = ?,
             action_text = ?, action_url = ?, pinned = ?, active = ?,
             starts_at = ?, ends_at = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        notice.title,
        notice.summary ?? null,
        notice.description,
        notice.variant,
        notice.imageId ?? null,
        notice.actionText ?? null,
        notice.actionUrl ?? null,
        notice.pinned ? 1 : 0,
        notice.active ? 1 : 0,
        notice.startsAt ?? null,
        notice.endsAt ?? null,
        notice.updatedAt ?? new Date().toISOString(),
        notice.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM notices WHERE id = ?').bind(id).run();
  }
}
