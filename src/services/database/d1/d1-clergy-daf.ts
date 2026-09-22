import type { Clergy } from '@/entities/clergy';
import type { ClergyDAF } from '../clergy-daf';

interface ClergyRow {
  id: string;
  title: string | null;
  name: string;
  slug: string;
  position: string;
  role_name: string | null;
  short_intro: string | null;
  bio: string | null;
  order_index: number | null;
  is_main: number | boolean | null;
  photo_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export class D1ClergyDAF implements ClergyDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: ClergyRow): Clergy {
    return {
      id: row.id,
      title: row.title,
      name: row.name,
      slug: row.slug,
      position: row.position as Clergy['position'],
      roleName: row.role_name,
      shortIntro: row.short_intro,
      bio: row.bio,
      orderIndex: row.order_index ?? 0,
      isMain: Boolean(row.is_main),
      photoId: row.photo_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Clergy | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, title, name, slug, position, role_name, short_intro, bio, order_index, is_main, photo_id, created_at, updated_at
       FROM clergy 
       WHERE id = ?`,
      )
      .bind(id)
      .first<ClergyRow>();

    if (!row) {
      return null;
    }

    return this.mapRowToEntity(row);
  }

  async findByName(name: string): Promise<Clergy | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, title, name, slug, position, role_name, short_intro, bio, order_index, is_main, photo_id, created_at, updated_at
       FROM clergy 
       WHERE name = ?`,
      )
      .bind(name)
      .first<ClergyRow>();

    if (!row) {
      return null;
    }

    return this.mapRowToEntity(row);
  }

  async findByPosition(position: Clergy['position']): Promise<Clergy | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, title, name, slug, position, role_name, short_intro, bio, order_index, is_main, photo_id, created_at, updated_at
       FROM clergy 
       WHERE position = ?`,
      )
      .bind(position)
      .first<ClergyRow>();

    if (!row) {
      return null;
    }

    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<Clergy[]> {
    const result = await this.d1
      .prepare(
        `SELECT id, title, name, slug, position, role_name, short_intro, bio, order_index, is_main, photo_id, created_at, updated_at
       FROM clergy
       ORDER BY order_index ASC, created_at ASC`,
      )
      .all<ClergyRow>();

    return result.results.map((row) => this.mapRowToEntity(row));
  }

  async create(clergy: Clergy): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO clergy (id, title, name, slug, position, role_name, short_intro, bio, order_index, is_main, photo_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        clergy.id,
        clergy.title || null,
        clergy.name,
        clergy.slug,
        clergy.position,
        clergy.roleName || null,
        clergy.shortIntro || null,
        clergy.bio || null,
        clergy.orderIndex ?? 0,
        clergy.isMain ? 1 : 0,
        clergy.photoId || null,
        clergy.createdAt,
        clergy.updatedAt || null,
      )
      .run();
  }

  async save(clergy: Clergy): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE clergy
       SET title = ?, name = ?, slug = ?, position = ?, role_name = ?, short_intro = ?, bio = ?, order_index = ?, is_main = ?, photo_id = ?, updated_at = ?
       WHERE id = ?`,
      )
      .bind(
        clergy.title || null,
        clergy.name,
        clergy.slug,
        clergy.position,
        clergy.roleName || null,
        clergy.shortIntro || null,
        clergy.bio || null,
        clergy.orderIndex ?? 0,
        clergy.isMain ? 1 : 0,
        clergy.photoId || null,
        clergy.updatedAt || null,
        clergy.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM clergy WHERE id = ?').bind(id).run();
  }
}
