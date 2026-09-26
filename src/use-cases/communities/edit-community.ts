import { ulid } from 'serverless-crypto-utils/id-generation';
import type { Community } from '@/entities/community';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { CommunityPhotosDAF } from '@/services/database/community-photos-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';
import { makeSlug } from '../factories/make-slug';
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists-error';
import { ParishAlreadyExistsError } from '../errors/parish-already-exists-error';

interface EditCommunityUseCaseRequest {
  id: string;
  name: string;
  type: 'chapel' | 'parish_church';
  address: string;
  coverId: string;
  heroSubtitle?: string | null;
  aboutTitle?: string | null;
  aboutDescription?: string | null;
  historySummary?: string | null;
  patronName?: string | null;
  patronDescription?: string | null;
  patronPhotoId?: string | null;
  photos?: {
    id?: string;
    photoId: string;
    caption?: string | null;
    orderIndex?: number;
  }[];
}

interface EditCommunityUseCaseResponse {
  community: Community;
}

export class EditCommunityUseCase {
  constructor(
    private communitiesDaf: CommunitiesDAF,
    private attachmentsDaf: AttachmentsDAF,
    private communityPhotosDaf: CommunityPhotosDAF,
  ) {}

  async execute({
    id,
    name,
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
    photos,
  }: EditCommunityUseCaseRequest): Promise<EditCommunityUseCaseResponse> {
    const community = await this.communitiesDaf.findById(id);

    if (!community) {
      throw new ResourceNotFoundError();
    }

    if (community.type !== type && type === 'parish_church') {
      const parishCommunity = await this.communitiesDaf.findParish();

      if (parishCommunity) {
        throw new ParishAlreadyExistsError();
      }
    }

    if (community.name !== name) {
      const communityWithSameName = await this.communitiesDaf.findByName(name);

      if (communityWithSameName) {
        throw new ResourceAlreadyExistsError();
      }
    }

    if (community.coverId !== coverId) {
      const attachment = await this.attachmentsDaf.findById(coverId);

      if (!attachment) {
        throw new AttachmentNotFoundError();
      }

      await Promise.all([
        this.attachmentsDaf.save(community.coverId, { status: 'deleted' }),
        this.attachmentsDaf.save(attachment.id, { status: 'attached' }),
      ]);
    }

    if (patronPhotoId !== undefined && community.patronPhotoId !== patronPhotoId) {
      if (patronPhotoId) {
        const attachment = await this.attachmentsDaf.findById(patronPhotoId);

        if (!attachment) {
          throw new AttachmentNotFoundError();
        }

        await this.attachmentsDaf.save(patronPhotoId, { status: 'attached' });
      }

      if (community.patronPhotoId) {
        await this.attachmentsDaf.save(community.patronPhotoId, { status: 'deleted' });
      }
    }

    if (photos !== undefined) {
      const existingPhotos = await this.communityPhotosDaf.findByCommunityId(id);

      const removedPhotos = existingPhotos.filter(
        (ep) => !photos.some((p) => p.photoId === ep.photoId),
      );
      for (const removed of removedPhotos) {
        await this.attachmentsDaf.save(removed.photoId, { status: 'deleted' });
      }

      const newPhotos = photos.filter(
        (p) => !existingPhotos.some((ep) => ep.photoId === p.photoId),
      );
      for (const newPhoto of newPhotos) {
        const attachment = await this.attachmentsDaf.findById(newPhoto.photoId);
        if (attachment) {
          await this.attachmentsDaf.save(newPhoto.photoId, { status: 'attached' });
        }
      }

      await this.communityPhotosDaf.deleteByCommunityId(id);

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        await this.communityPhotosDaf.create({
          id: photo.id || ulid(),
          communityId: id,
          photoId: photo.photoId,
          caption: photo.caption ?? null,
          orderIndex: photo.orderIndex ?? i,
          createdAt: new Date().toISOString(),
        });
      }
    }

    community.name = name;
    community.slug = makeSlug(name);
    community.type = type;
    community.address = address;
    community.coverId = coverId;
    if (heroSubtitle !== undefined) community.heroSubtitle = heroSubtitle;
    if (aboutTitle !== undefined) community.aboutTitle = aboutTitle;
    if (aboutDescription !== undefined) community.aboutDescription = aboutDescription;
    if (historySummary !== undefined) community.historySummary = historySummary;
    if (patronName !== undefined) community.patronName = patronName;
    if (patronDescription !== undefined) community.patronDescription = patronDescription;
    if (patronPhotoId !== undefined) community.patronPhotoId = patronPhotoId || undefined;
    community.updatedAt = new Date().toISOString();

    await this.communitiesDaf.save(community);

    return { community };
  }
}
