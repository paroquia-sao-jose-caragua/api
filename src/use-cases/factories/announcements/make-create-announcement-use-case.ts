import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { CreateAnnouncementUseCase } from '@/use-cases/announcements/create-announcement';

export function makeCreateAnnouncementUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  return new CreateAnnouncementUseCase(announcementsDaf, attachmentsDaf);
}
