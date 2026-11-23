import type { Notice, NoticeVariant } from '@/entities/notice';
import type { NoticesDAF } from '@/services/database/notices-daf';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface CreateNoticeRequest {
  title: string;
  summary?: string | null;
  description: string;
  variant?: NoticeVariant;
  imageId?: string | null;
  actionText?: string | null;
  actionUrl?: string | null;
  pinned?: boolean;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

interface CreateNoticeResponse {
  notice: Notice;
}

export class CreateNoticeUseCase {
  constructor(
    private noticesDaf: NoticesDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute(request: CreateNoticeRequest): Promise<CreateNoticeResponse> {
    if (request.imageId) {
      const image = await this.attachmentsDaf.findById(request.imageId);
      if (!image) {
        throw new AttachmentNotFoundError();
      }
      await this.attachmentsDaf.save(image.id, { status: 'attached' });
    }

    const notice: Notice = {
      id: ulid(),
      title: request.title,
      summary: request.summary ?? null,
      description: request.description,
      variant: request.variant ?? 'info',
      imageId: request.imageId ?? null,
      actionText: request.actionText ?? null,
      actionUrl: request.actionUrl ?? null,
      pinned: request.pinned ?? false,
      active: request.active ?? true,
      startsAt: request.startsAt ?? null,
      endsAt: request.endsAt ?? null,
      createdAt: new Date().toISOString(),
    };

    await this.noticesDaf.create(notice);

    return { notice };
  }
}
