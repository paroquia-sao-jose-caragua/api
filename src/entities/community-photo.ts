export type CommunityPhoto = {
  id: string;
  communityId: string;
  photoId: string;
  photoUrl?: string;
  caption?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
};
