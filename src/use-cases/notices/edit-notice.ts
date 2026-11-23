import type { Notice, NoticeVariant } from '@/entities/notice';
import type { NoticesDAF } from '@/services/database/notices-daf';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditNoticeRequest {
  id: string;
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

interface EditNoticeResponse {
  notice: Notice;
}

export class EditNoticeUseCase {
  constructor(
    private noticesDaf: NoticesDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute(request: EditNoticeRequest): Promise<EditNoticeResponse> {
    const existing = await this.noticesDaf.findById(request.id);
    if (!existing) {
      throw new ResourceNotFoundError();
    }

    if (request.imageId && request.imageId !== existing.imageId) {
      const image = await this.attachmentsDaf.findById(request.imageId);
      if (!image) {
        throw new AttachmentNotFoundError();
      }
      await this.attachmentsDaf.save(image.id, { status: 'attached' });
    }

    const updated: Notice = {
      ...existing,
      title: request.title,
      summary: request.summary ?? null,
      description: request.description,
      variant: request.variant ?? existing.variant,
      imageId: request.imageId ?? null,
      actionText: request.actionText ?? null,
      actionUrl: request.actionUrl ?? null,
      pinned: request.pinned ?? existing.pinned,
      active: request.active ?? existing.active,
      startsAt: request.startsAt ?? null,
      endsAt: request.endsAt ?? null,
      updatedAt: new Date().toISOString(),
    };

    await this.noticesDaf.save(updated);

    return { notice: updated };
  }
}
