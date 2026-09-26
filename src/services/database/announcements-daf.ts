import type { Announcement } from '@/entities/announcement';

export interface AnnouncementsDAF {
  findById(id: string): Promise<Announcement | null>;
  findAll(): Promise<Announcement[]>;
  findActive(): Promise<Announcement[]>;
  create(announcement: Announcement): Promise<void>;
  save(announcement: Announcement): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
}
