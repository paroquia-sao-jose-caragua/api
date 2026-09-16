import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { ReorderAnnouncementsUseCase } from '@/use-cases/announcements/reorder-announcements';

export function makeReorderAnnouncementsUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  return new ReorderAnnouncementsUseCase(announcementsDaf);
}
