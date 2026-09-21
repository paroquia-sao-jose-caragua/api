import type { CommunityPhoto } from '@/entities/community-photo';
import type { CommunityPhotosDAF } from '../community-photos-daf';

export class D1CommunityPhotosDAF implements CommunityPhotosDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findByCommunityId(communityId: string): Promise<CommunityPhoto[]> {
    const rows = await this.d1
      .prepare(
        `SELECT id, community_id, photo_id, caption, order_index, created_at, updated_at
         FROM community_photos
         WHERE community_id = ?
         ORDER BY order_index ASC, created_at ASC`,
      )
      .bind(communityId)
      .all<{
        id: string;
        community_id: string;
        photo_id: string;
        caption: string | null;
        order_index: number | null;
        created_at: string;
        updated_at: string | null;
      }>();

    return rows.results.map((row) => ({
      id: row.id,
      communityId: row.community_id,
      photoId: row.photo_id,
      caption: row.caption ?? undefined,
      orderIndex: row.order_index ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
    }));
  }

  async findMany(communityId: string): Promise<CommunityPhoto[]> {
    return this.findByCommunityId(communityId);
  }

  async create({
    id,
    communityId,
    photoId,
    caption,
    orderIndex = 0,
    createdAt,
  }: CommunityPhoto): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO community_photos (id, community_id, photo_id, caption, order_index, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, communityId, photoId, caption ?? null, orderIndex, createdAt)
      .run();
  }

  async createMany(photos: CommunityPhoto[]): Promise<void> {
    if (photos.length === 0) return;

    const queries = photos.map((photo) =>
      this.d1
        .prepare(
          `INSERT INTO community_photos (id, community_id, photo_id, caption, order_index, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          photo.id,
          photo.communityId,
          photo.photoId,
          photo.caption ?? null,
          photo.orderIndex ?? 0,
          photo.createdAt,
        ),
    );

    await this.d1.batch(queries);
  }

  async delete(id: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM community_photos WHERE id = ?')
      .bind(id)
      .run();
  }

  async deleteByCommunityId(communityId: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM community_photos WHERE community_id = ?')
      .bind(communityId)
      .run();
  }
}
