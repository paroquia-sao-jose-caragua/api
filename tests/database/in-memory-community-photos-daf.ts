import type { CommunityPhoto } from '@/entities/community-photo';
import type { CommunityPhotosDAF } from '@/services/database/community-photos-daf';

export class InMemoryCommunityPhotosDAF implements CommunityPhotosDAF {
  public photos: CommunityPhoto[] = [];

  async findByCommunityId(communityId: string): Promise<CommunityPhoto[]> {
    return this.photos
      .filter((p) => p.communityId === communityId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async create(photo: CommunityPhoto): Promise<void> {
    this.photos.push(photo);
  }

  async deleteByCommunityId(communityId: string): Promise<void> {
    this.photos = this.photos.filter((p) => p.communityId !== communityId);
  }

  async delete(id: string): Promise<void> {
    this.photos = this.photos.filter((p) => p.id !== id);
  }
}
