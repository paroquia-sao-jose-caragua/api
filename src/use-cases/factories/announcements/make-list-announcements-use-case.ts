import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { ListAnnouncementsUseCase } from '@/use-cases/announcements/list-announcements';

export function makeListAnnouncementsUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  return new ListAnnouncementsUseCase(announcementsDaf);
}
