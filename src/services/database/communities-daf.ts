import type { Community } from '@/entities/community';

export interface CommunitiesDAF {
  findById: (id: string) => Promise<Community | null>;
  findBySlug: (slug: string) => Promise<Community | null>;
  findByName: (name: string) => Promise<Community | null>;
  findParish: () => Promise<Community | null>;
  findAll: () => Promise<Community[]>;
  create(data: {
    id: string;
    name: string;
    slug: string;
    type: 'chapel' | 'parish_church';
    address: string;
    coverId: string;
    createdAt: string;
  }): Promise<void>;
  save: (community: Community) => Promise<void>;
  delete: (id: string) => Promise<void>;
}
