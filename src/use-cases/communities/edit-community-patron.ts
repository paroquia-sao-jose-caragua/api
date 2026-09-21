import type { Community } from '@/entities/community';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';

interface EditCommunityPatronUseCaseRequest {
  id: string;
  patronName?: string | null;
  patronDescription?: string | null;
  patronPhotoId?: string | null;
}

interface EditCommunityPatronUseCaseResponse {
  community: Community;
}

export class EditCommunityPatronUseCase {
  constructor(
    private communitiesDaf: CommunitiesDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute({
    id,
    patronName,
    patronDescription,
    patronPhotoId,
  }: EditCommunityPatronUseCaseRequest): Promise<EditCommunityPatronUseCaseResponse> {
    const community = await this.communitiesDaf.findById(id);

    if (!community) {
      throw new ResourceNotFoundError();
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

    if (patronName !== undefined) community.patronName = patronName;
    if (patronDescription !== undefined) community.patronDescription = patronDescription;
    if (patronPhotoId !== undefined) community.patronPhotoId = patronPhotoId || undefined;
    community.updatedAt = new Date().toISOString();

    await this.communitiesDaf.save(community);

    return { community };
  }
}
