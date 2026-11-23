import type { Notice } from '@/entities/notice';
import type { NoticesDAF } from '@/services/database/notices-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export class GetNoticeUseCase {
  constructor(private noticesDaf: NoticesDAF) {}

  async execute(id: string): Promise<{ notice: Notice }> {
    const notice = await this.noticesDaf.findById(id);
    if (!notice) {
      throw new ResourceNotFoundError();
    }

    return { notice };
  }
}
