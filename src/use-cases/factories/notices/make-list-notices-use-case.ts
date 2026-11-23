import { D1NoticesDAF } from '@/services/database/d1/d1-notices-daf';
import { ListNoticesUseCase } from '@/use-cases/notices/list-notices';

export function makeListNoticesUseCase(c: DomainContext) {
  const noticesDaf = new D1NoticesDAF(c.env.DB);
  return new ListNoticesUseCase(noticesDaf);
}
