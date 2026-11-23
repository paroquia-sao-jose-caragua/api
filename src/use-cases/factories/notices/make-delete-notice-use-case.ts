import { D1NoticesDAF } from '@/services/database/d1/d1-notices-daf';
import { DeleteNoticeUseCase } from '@/use-cases/notices/delete-notice';

export function makeDeleteNoticeUseCase(c: DomainContext) {
  const noticesDaf = new D1NoticesDAF(c.env.DB);
  return new DeleteNoticeUseCase(noticesDaf);
}
