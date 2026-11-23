import { D1NoticesDAF } from '@/services/database/d1/d1-notices-daf';
import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { EditNoticeUseCase } from '@/use-cases/notices/edit-notice';

export function makeEditNoticeUseCase(c: DomainContext) {
  const noticesDaf = new D1NoticesDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  return new EditNoticeUseCase(noticesDaf, attachmentsDaf);
}
