import type { Announcement } from '@/entities/announcement';
import type { AnnouncementsDAF } from '@/services/database/announcements-daf';

export class ListActiveAnnouncementsUseCase {
  constructor(private announcementsDaf: AnnouncementsDAF) {}

  async execute(): Promise<{ announcements: Announcement[] }> {
    const announcements = await this.announcementsDaf.findActive();
    return { announcements };
  }
}
