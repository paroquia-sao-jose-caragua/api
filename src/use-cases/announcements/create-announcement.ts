import type { Announcement } from '@/entities/announcement';
import type { AnnouncementsDAF } from '@/services/database/announcements-daf';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import { AttachmentNotFoundError } from '../errors/attachment-not-found-error';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface CreateAnnouncementRequest {
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

interface CreateAnnouncementResponse {
  announcement: Announcement;
}

export class CreateAnnouncementUseCase {
  constructor(
    private announcementsDaf: AnnouncementsDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute(request: CreateAnnouncementRequest): Promise<CreateAnnouncementResponse> {
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

    const announcement: Announcement = {
      id: ulid(),
      badgeText: request.badgeText ?? null,
      title: request.title,
      description: request.description,
      actionText: request.actionText ?? null,
      actionUrl: request.actionUrl ?? null,
      coverDesktopId: request.coverDesktopId,
      coverTabletId: request.coverTabletId ?? null,
      coverMobileId: request.coverMobileId ?? null,
      sortOrder: request.sortOrder ?? 0,
      active: request.active ?? true,
      startsAt: request.startsAt ?? null,
      endsAt: request.endsAt ?? null,
      createdAt: new Date().toISOString(),
    };

    await this.announcementsDaf.create(announcement);

    return { announcement };
  }
}
