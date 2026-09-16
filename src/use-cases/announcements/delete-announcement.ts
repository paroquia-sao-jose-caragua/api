import type { AnnouncementsDAF } from '@/services/database/announcements-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export class DeleteAnnouncementUseCase {
  constructor(private announcementsDaf: AnnouncementsDAF) {}

  async execute(id: string): Promise<void> {
    const existing = await this.announcementsDaf.findById(id);
    if (!existing) {
      throw new ResourceNotFoundError();
    }

    await this.announcementsDaf.delete(id);
  }
}
