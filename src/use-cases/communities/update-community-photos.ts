import { ulid } from 'serverless-crypto-utils/id-generation';
import type { CommunityPhoto } from '@/entities/community-photo';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { CommunityPhotosDAF } from '@/services/database/community-photos-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface UpdateCommunityPhotosUseCaseRequest {
  communityId: string;
  photos: {
    id?: string;
    photoId: string;
    caption?: string | null;
    orderIndex?: number;
  }[];
}

interface UpdateCommunityPhotosUseCaseResponse {
  photos: CommunityPhoto[];
}

export class UpdateCommunityPhotosUseCase {
  constructor(
    private communitiesDaf: CommunitiesDAF,
    private attachmentsDaf: AttachmentsDAF,
    private communityPhotosDaf: CommunityPhotosDAF,
  ) {}

  async execute({
    communityId,
    photos,
  }: UpdateCommunityPhotosUseCaseRequest): Promise<UpdateCommunityPhotosUseCaseResponse> {
    const community = await this.communitiesDaf.findById(communityId);

    if (!community) {
      throw new ResourceNotFoundError();
    }

    const existingPhotos = await this.communityPhotosDaf.findByCommunityId(communityId);

    // Photos that were deleted
    const removedPhotos = existingPhotos.filter(
      (ep) => !photos.some((p) => p.photoId === ep.photoId),
    );
    for (const removed of removedPhotos) {
      await this.attachmentsDaf.save(removed.photoId, { status: 'deleted' });
    }

    // New photos attached
    const newPhotos = photos.filter(
      (p) => !existingPhotos.some((ep) => ep.photoId === p.photoId),
    );
    for (const newPhoto of newPhotos) {
      const attachment = await this.attachmentsDaf.findById(newPhoto.photoId);
      if (attachment) {
        await this.attachmentsDaf.save(newPhoto.photoId, { status: 'attached' });
      }
    }

    // Clear and rebuild community photos in order
    await this.communityPhotosDaf.deleteByCommunityId(communityId);

    const savedPhotos: CommunityPhoto[] = [];

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const photoEntity: CommunityPhoto = {
        id: p.id || ulid(),
        communityId,
        photoId: p.photoId,
        caption: p.caption ?? undefined,
        orderIndex: p.orderIndex ?? i,
        createdAt: new Date().toISOString(),
      };

      await this.communityPhotosDaf.create(photoEntity);
      savedPhotos.push(photoEntity);
    }

    return { photos: savedPhotos };
  }
}
