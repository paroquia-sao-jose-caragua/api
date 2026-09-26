import type { Clergy, ClergyPosition } from '@/entities/clergy';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import type { ClergyDAF } from '@/services/database/clergy-daf';
import { ulid } from 'serverless-crypto-utils/id-generation';
import { makeSlug } from '../factories/make-slug';

interface CreateClergyUseCaseRequest {
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

interface CreateClergyUseCaseResponse {
  clergy: Clergy;
}

export class CreateClergyUseCase {
  constructor(
    private clergyDaf: ClergyDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute({
    title,
    name,
    position,
    roleName,
    shortIntro,
    bio,
    orderIndex = 0,
    isMain = false,
    photoId,
  }: CreateClergyUseCaseRequest): Promise<CreateClergyUseCaseResponse> {
    if (photoId) {
      const attachment = await this.attachmentsDaf.findById(photoId);
      if (attachment) {
        await this.attachmentsDaf.save(attachment.id, { status: 'attached' });
      }
    }

    const clergy: Clergy = {
      id: ulid(),
      title: title || null,
      name,
      slug: makeSlug((title ? `${title} ` : '') + name),
      position,
      roleName: roleName || null,
      shortIntro: shortIntro || null,
      bio: bio || null,
      orderIndex,
      isMain,
      photoId: photoId || null,
      createdAt: new Date().toISOString(),
    };

    await this.clergyDaf.create(clergy);

    return { clergy };
  }
}
