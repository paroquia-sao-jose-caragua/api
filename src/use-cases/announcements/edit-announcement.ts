import type { Announcement } from '@/entities/announcement';
import type { AnnouncementsDAF } from '@/services/database/announcements-daf';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditAnnouncementRequest {
  id: string;
  badgeText?: string | null;
  title: string;
  description: string;
  actionText?: string | null;
  actionUrl?: string | null;
  coverDesktopId: string;
  coverTabletId?: string | null;
  coverMobileId?: string | null;
  sortOrder?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

interface EditAnnouncementResponse {
  announcement: Announcement;
}

export class EditAnnouncementUseCase {
  constructor(
    private announcementsDaf: AnnouncementsDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute(request: EditAnnouncementRequest): Promise<EditAnnouncementResponse> {
    const existing = await this.announcementsDaf.findById(request.id);
    if (!existing) {
      throw new ResourceNotFoundError();
    }

    const desktopCover = await this.attachmentsDaf.findById(request.coverDesktopId);
    if (!desktopCover) {
      throw new AttachmentNotFoundError();
    }
    await this.attachmentsDaf.save(desktopCover.id, { status: 'attached' });

    if (request.coverTabletId) {
      const tabletCover = await this.attachmentsDaf.findById(request.coverTabletId);
      if (tabletCover) {
        await this.attachmentsDaf.save(tabletCover.id, { status: 'attached' });
      }
    }

    if (request.coverMobileId) {
      const mobileCover = await this.attachmentsDaf.findById(request.coverMobileId);
      if (mobileCover) {
        await this.attachmentsDaf.save(mobileCover.id, { status: 'attached' });
      }
    }

    const updated: Announcement = {
      ...existing,
      badgeText: request.badgeText ?? null,
      title: request.title,
      description: request.description,
      actionText: request.actionText ?? null,
      actionUrl: request.actionUrl ?? null,
      coverDesktopId: request.coverDesktopId,
      coverTabletId: request.coverTabletId ?? null,
      coverMobileId: request.coverMobileId ?? null,
      sortOrder: request.sortOrder ?? existing.sortOrder,
      active: request.active ?? existing.active,
      startsAt: request.startsAt ?? null,
      endsAt: request.endsAt ?? null,
      updatedAt: new Date().toISOString(),
    };

    await this.announcementsDaf.save(updated);

    return { announcement: updated };
  }
}
