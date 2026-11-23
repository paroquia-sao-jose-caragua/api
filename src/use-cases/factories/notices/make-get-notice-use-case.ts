import { D1NoticesDAF } from '@/services/database/d1/d1-notices-daf';
import { GetNoticeUseCase } from '@/use-cases/notices/get-notice';

export function makeGetNoticeUseCase(c: DomainContext) {
  const noticesDaf = new D1NoticesDAF(c.env.DB);
  return new GetNoticeUseCase(noticesDaf);
}
