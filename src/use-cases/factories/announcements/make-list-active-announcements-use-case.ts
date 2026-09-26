import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { ListActiveAnnouncementsUseCase } from '@/use-cases/announcements/list-active-announcements';

export function makeListActiveAnnouncementsUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  return new ListActiveAnnouncementsUseCase(announcementsDaf);
}
