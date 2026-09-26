import type { CommunitiesDAF } from '../communities-daf';
import type { Community } from '@/entities/community';

type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  type: 'chapel' | 'parish_church';
  address: string;
  cover_id: string;
  hero_subtitle: string | null;
  about_title: string | null;
  about_description: string | null;
  history_summary: string | null;
  patron_name: string | null;
  patron_description: string | null;
  patron_photo_id: string | null;
  updated_at: string | null;
  created_at: string;
};

function mapRowToCommunity(row: CommunityRow): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    address: row.address,
    coverId: row.cover_id,
    heroSubtitle: row.hero_subtitle ?? undefined,
    aboutTitle: row.about_title ?? undefined,
    aboutDescription: row.about_description ?? undefined,
    historySummary: row.history_summary ?? undefined,
    patronName: row.patron_name ?? undefined,
    patronDescription: row.patron_description ?? undefined,
    patronPhotoId: row.patron_photo_id ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    createdAt: row.created_at,
  };
}

const SELECT_COMMUNITIES_FIELDS = `
  id, name, slug, type, address, cover_id,
  hero_subtitle, about_title, about_description, history_summary,
  patron_name, patron_description, patron_photo_id,
  updated_at, created_at
`;

export class D1CommunitiesDAF implements CommunitiesDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(id: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT ${SELECT_COMMUNITIES_FIELDS}
         FROM communities 
         WHERE id = ?`,
      )
      .bind(id)
      .first<CommunityRow>();

    if (!community) {
      return null;
    }

    return mapRowToCommunity(community);
  }

  async findBySlug(slug: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT ${SELECT_COMMUNITIES_FIELDS}
         FROM communities 
         WHERE slug = ?`,
      )
      .bind(slug)
      .first<CommunityRow>();

    if (!community) {
      return null;
    }

    return mapRowToCommunity(community);
  }

  async findByName(name: string): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT ${SELECT_COMMUNITIES_FIELDS}
         FROM communities 
         WHERE name = ?`,
      )
      .bind(name)
      .first<CommunityRow>();

    if (!community) {
      return null;
    }

    return mapRowToCommunity(community);
  }

  async findParish(): Promise<Community | null> {
    const community = await this.d1
      .prepare(
        `SELECT ${SELECT_COMMUNITIES_FIELDS}
         FROM communities 
         WHERE type = ?`,
      )
      .bind('parish_church')
      .first<CommunityRow>();

    if (!community) {
      return null;
    }

    return mapRowToCommunity(community);
  }

  async findAll(): Promise<Community[]> {
    const communities = await this.d1
      .prepare(
        `SELECT ${SELECT_COMMUNITIES_FIELDS}
         FROM communities`,
      )
      .all<CommunityRow>();

    return communities.results.map(mapRowToCommunity);
  }

  async create({
    id,
    name,
    slug,
    type,
    address,
    coverId,
    heroSubtitle,
    aboutTitle,
    aboutDescription,
    historySummary,
    patronName,
    patronDescription,
    patronPhotoId,
    createdAt,
  }: {
    id: string;
    name: string;
    slug: string;
    type: 'chapel' | 'parish_church';
    address: string;
    coverId: string;
    heroSubtitle?: string;
    aboutTitle?: string;
    aboutDescription?: string;
    historySummary?: string;
    patronName?: string;
    patronDescription?: string;
    patronPhotoId?: string;
    createdAt: string;
  }) {
    await this.d1
      .prepare(
        `INSERT INTO communities (
          id, name, slug, type, address, cover_id,
          hero_subtitle, about_title, about_description, history_summary,
          patron_name, patron_description, patron_photo_id,
          created_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        name,
        slug,
        type,
        address,
        coverId,
        heroSubtitle ?? null,
        aboutTitle ?? null,
        aboutDescription ?? null,
        historySummary ?? null,
        patronName ?? null,
        patronDescription ?? null,
        patronPhotoId ?? null,
        createdAt,
      )
      .run();
  }

  async save(data: Community) {
    await this.d1
      .prepare(
        `UPDATE communities 
         SET name = ?,
             slug = ?,
             type = ?,
             address = ?,
             cover_id = ?,
             hero_subtitle = ?,
             about_title = ?,
             about_description = ?,
             history_summary = ?,
             patron_name = ?,
             patron_description = ?,
             patron_photo_id = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        data.name,
        data.slug,
        data.type,
        data.address,
        data.coverId,
        data.heroSubtitle ?? null,
        data.aboutTitle ?? null,
        data.aboutDescription ?? null,
        data.historySummary ?? null,
        data.patronName ?? null,
        data.patronDescription ?? null,
        data.patronPhotoId ?? null,
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
