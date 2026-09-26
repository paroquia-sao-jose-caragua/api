import type { Clergy, ClergyPosition } from '@/entities/clergy';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import type { ClergyDAF } from '@/services/database/clergy-daf';
import { makeSlug } from '../factories/make-slug';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditClergyUseCaseRequest {
  clergyId: string;
  title?: string | null;
  name: string;
  position: ClergyPosition;
  roleName?: string | null;
  shortIntro?: string | null;
  bio?: string | null;
  orderIndex?: number;
  isMain?: boolean;
  photoId?: string | null;
}

interface EditClergyUseCaseResponse {
  clergy: Clergy;
}

export class EditClergyUseCase {
  constructor(
    private clergyDaf: ClergyDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute({
    clergyId,
    title,
    name,
    position,
    roleName,
    shortIntro,
    bio,
    orderIndex = 0,
    isMain = false,
    photoId,
  }: EditClergyUseCaseRequest): Promise<EditClergyUseCaseResponse> {
    const clergy = await this.clergyDaf.findById(clergyId);

    if (!clergy) {
      throw new ResourceNotFoundError();
    }

    if (photoId && photoId !== clergy.photoId) {
      const attachment = await this.attachmentsDaf.findById(photoId);
      if (attachment) {
        if (clergy.photoId) {
          await this.attachmentsDaf.save(clergy.photoId, { status: 'deleted' });
        }
        await this.attachmentsDaf.save(attachment.id, { status: 'attached' });
      }
    }

    clergy.title = title || null;
    clergy.name = name;
    clergy.slug = makeSlug((title ? `${title} ` : '') + name);
    clergy.position = position;
    clergy.roleName = roleName || null;
    clergy.shortIntro = shortIntro || null;
    clergy.bio = bio || null;
    clergy.orderIndex = orderIndex;
    clergy.isMain = isMain;
    if (photoId !== undefined) {
      clergy.photoId = photoId || null;
    }
    clergy.updatedAt = new Date().toISOString();

    await this.clergyDaf.save(clergy);

    return { clergy };
  }
}
