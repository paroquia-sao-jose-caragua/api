import type { Notice } from '@/entities/notice';

export interface NoticesDAF {
  findById(id: string): Promise<Notice | null>;
  findAll(): Promise<Notice[]>;
  findActive(): Promise<Notice[]>;
  create(notice: Notice): Promise<void>;
  save(notice: Notice): Promise<void>;
  delete(id: string): Promise<void>;
}
