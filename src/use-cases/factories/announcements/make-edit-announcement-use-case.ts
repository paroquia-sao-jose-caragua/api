import { D1AnnouncementsDAF } from '@/services/database/d1/d1-announcements-daf';
import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { EditAnnouncementUseCase } from '@/use-cases/announcements/edit-announcement';

export function makeEditAnnouncementUseCase(c: DomainContext) {
  const announcementsDaf = new D1AnnouncementsDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  return new EditAnnouncementUseCase(announcementsDaf, attachmentsDaf);
}
