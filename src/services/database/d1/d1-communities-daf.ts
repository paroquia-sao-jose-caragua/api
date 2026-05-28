import type { CommunitiesDAF } from '../communities-daf';
import type { Community } from '@/entities/community';

export class D1CommunitiesDAF implements CommunitiesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(id: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT id, name, slug, type, address, cover_id, updated_at, created_at
         FROM communities 
         WHERE id = ?`,
      )
      .bind(id)
      .first<{
        id: string;
        name: string;
        slug: string;
        type: 'chapel' | 'parish_church';
        address: string;
        cover_id: string;
        updated_at: string;
        created_at: string;
      }>();

    if (!community) {
      return null;
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      type: community.type,
      address: community.address,
      coverId: community.cover_id,
      updatedAt: community?.updated_at,
      createdAt: community.created_at,
    };
  }

  async findBySlug(slug: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT id, name, slug, type, address, cover_id, updated_at, created_at
         FROM communities 
         WHERE slug = ?`,
      )
      .bind(slug)
      .first<{
        id: string;
        name: string;
        slug: string;
        type: 'chapel' | 'parish_church';
        address: string;
        cover_id: string;
        updated_at: string;
        created_at: string;
      }>();

    if (!community) {
      return null;
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      type: community.type,
      address: community.address,
      coverId: community.cover_id,
      updatedAt: community?.updated_at,
      createdAt: community.created_at,
    };
  }

  async findByName(name: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT id, name, slug, type, address, cover_id, updated_at, created_at
         FROM communities 
         WHERE name = ?`,
      )
      .bind(name)
      .first<{
        id: string;
        name: string;
        slug: string;
        type: 'chapel' | 'parish_church';
        address: string;
        cover_id: string;
        updated_at: string;
        created_at: string;
      }>();

    if (!community) {
      return null;
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      type: community.type,
      address: community.address,
      coverId: community.cover_id,
      updatedAt: community?.updated_at,
      createdAt: community.created_at,
    };
  }

  async findParish(): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT id, name, slug, type, address, cover_id, updated_at, created_at
         FROM communities 
         WHERE type = ?`,
      )
      .bind('parish_church')
      .first<{
        id: string;
        name: string;
        slug: string;
        type: 'parish_church';
        address: string;
        cover_id: string;
        updated_at: string;
        created_at: string;
      }>();

    if (!community) {
      return null;
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      type: community.type,
      address: community.address,
      coverId: community.cover_id,
      updatedAt: community?.updated_at,
      createdAt: community.created_at,
    };
  }

  async findAll(): Promise<Community[]> {
    const communities = await this.d1
      .prepare(
        `SELECT id, name, slug, type, address, cover_id, updated_at, created_at
         FROM communities`,
      )
      .all<{
        id: string;
        name: string;
        slug: string;
        type: 'chapel' | 'parish_church';
        address: string;
        cover_id: string;
        updated_at: string;
        created_at: string;
      }>();

    console.log('Communities fetched from D1:', communities);

    return communities.results.map((community) => ({
      id: community.id,
      name: community.name,
      slug: community.slug,
      type: community.type,
      address: community.address,
      coverId: community.cover_id,
      updatedAt: community?.updated_at,
      createdAt: community.created_at,
    }));
  }

  async create({
    id,
    name,
    slug,
    type,
    address,
    coverId,
    createdAt,
  }: {
    id: string;
    name: string;
    slug: string;
    type: 'chapel' | 'parish_church';
    address: string;
    coverId: string;
    createdAt: string;
  }) {
    await this.d1
      .prepare(
        `INSERT INTO communities (id, name, slug, type, address, cover_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, name, slug, type, address, coverId, createdAt)
      .first<{
        id: string;
        name: string;
        slug: string;
        type: 'chapel' | 'parish_church';
        address: string;
        cover_id: string;
        created_at: string;
      }>();
  }

  async save(data: Community) {
    await this.d1
      .prepare(
        `UPDATE communities 
       SET name = ?, slug = ?, type = ?, address = ?, cover_id = ?, updated_at = ?
       WHERE id = ?`,
      )
      .bind(
        data.name,
        data.slug,
        data.type,
        data.address,
        data.coverId,
        data.updatedAt,
        data.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM communities WHERE id = ?')
      .bind(id)
      .run();
  }
}
