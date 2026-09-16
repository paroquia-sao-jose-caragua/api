import type { AnnouncementsDAF } from '@/services/database/announcements-daf';

export class ReorderAnnouncementsUseCase {
  constructor(private announcementsDaf: AnnouncementsDAF) {}

  async execute(orderedIds: string[]): Promise<void> {
    await this.announcementsDaf.reorder(orderedIds);
  }
}
