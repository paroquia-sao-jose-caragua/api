import type { CommunityPhoto } from '@/entities/community-photo';

export interface CommunityPhotosDAF {
  findByCommunityId(communityId: string): Promise<CommunityPhoto[]>;
  findMany?(communityId: string): Promise<CommunityPhoto[]>;
  create(photo: CommunityPhoto): Promise<void>;
  createMany(photos: CommunityPhoto[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByCommunityId(communityId: string): Promise<void>;
}
