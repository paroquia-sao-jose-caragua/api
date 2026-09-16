import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { DeleteAnnouncementUseCase } from '@/use-cases/announcements/delete-announcement';

export function makeDeleteAnnouncementUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  return new DeleteAnnouncementUseCase(announcementsDaf);
}
