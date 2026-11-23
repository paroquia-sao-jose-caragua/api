import type { NoticesDAF } from '@/services/database/notices-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export class DeleteNoticeUseCase {
  constructor(private noticesDaf: NoticesDAF) {}

  async execute(id: string): Promise<void> {
    const existing = await this.noticesDaf.findById(id);
    if (!existing) {
      throw new ResourceNotFoundError();
    }

    await this.noticesDaf.delete(id);
  }
}
