import type { Notice } from '@/entities/notice';
import type { NoticesDAF } from '@/services/database/notices-daf';

export class ListNoticesUseCase {
  constructor(private noticesDaf: NoticesDAF) {}

  async execute(): Promise<{ notices: Notice[] }> {
    const notices = await this.noticesDaf.findAll();
    return { notices };
  }
}
