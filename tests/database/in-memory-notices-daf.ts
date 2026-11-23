import type { Notice } from '@/entities/notice';
import type { NoticesDAF } from '@/services/database/notices-daf';

export class InMemoryNoticesDAF implements NoticesDAF {
  public items: Notice[] = [];

  private sortNotices(list: Notice[]): Notice[] {
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  async findById(id: string): Promise<Notice | null> {
    const notice = this.items.find((item) => item.id === id);
    return notice ?? null;
  }

  async findAll(): Promise<Notice[]> {
    return this.sortNotices(this.items);
  }

  async findActive(): Promise<Notice[]> {
    const now = new Date().toISOString();
    const active = this.items.filter((item) => {
      if (!item.active) return false;
      if (item.startsAt && item.startsAt > now) return false;
      if (item.endsAt && item.endsAt < now) return false;
      return true;
    });
    return this.sortNotices(active);
  }

  async create(notice: Notice): Promise<void> {
    this.items.push(notice);
  }

  async save(notice: Notice): Promise<void> {
    const index = this.items.findIndex((item) => item.id === notice.id);
    if (index >= 0) {
      this.items[index] = notice;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
