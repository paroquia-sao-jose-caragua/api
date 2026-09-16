import type { Announcement } from '@/entities/announcement';
import type { AnnouncementsDAF } from '@/services/database/announcements-daf';

export class InMemoryAnnouncementsDAF implements AnnouncementsDAF {
  public items: Announcement[] = [];

  async findById(id: string): Promise<Announcement | null> {
    const item = this.items.find((a) => a.id === id);
    return item ? { ...item } : null;
  }

  async findAll(): Promise<Announcement[]> {
    return [...this.items].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findActive(): Promise<Announcement[]> {
    const now = new Date().toISOString();
    return this.items
      .filter((a) => {
        if (!a.active) return false;
        if (a.startsAt && a.startsAt > now) return false;
        if (a.endsAt && a.endsAt < now) return false;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async create(announcement: Announcement): Promise<void> {
    this.items.push(announcement);
  }

  async save(announcement: Announcement): Promise<void> {
    const index = this.items.findIndex((a) => a.id === announcement.id);
    if (index >= 0) {
      this.items[index] = announcement;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((a) => a.id !== id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const item = this.items.find((a) => a.id === id);
      if (item) {
        item.sortOrder = index;
      }
    });
  }
}
