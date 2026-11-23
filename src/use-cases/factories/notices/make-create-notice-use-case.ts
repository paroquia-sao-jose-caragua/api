import { D1NoticesDAF } from '@/services/database/d1/d1-notices-daf';
import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { CreateNoticeUseCase } from '@/use-cases/notices/create-notice';

export function makeCreateNoticeUseCase(c: DomainContext) {
  const noticesDaf = new D1NoticesDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  return new CreateNoticeUseCase(noticesDaf, attachmentsDaf);
}
