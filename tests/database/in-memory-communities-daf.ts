import type { Community } from '@/entities/community';
import type { CommunitiesDAF } from '@/services/database/communities-daf';

export class InMemoryCommunitiesDAF implements CommunitiesDAF {
  public communities: Community[] = [];

  async findById(id: string): Promise<Community | null> {
    const community = this.communities.find((c) => c.id === id);

    if (!community) {
      return null;
    }

    return community;
  }

  async findByName(name: string): Promise<Community | null> {
    const community = this.communities.find((c) => c.name === name);

    if (!community) {
      return null;
    }

    return community;
  }

  async findBySlug(slug: string): Promise<Community | null> {
    const community = this.communities.find((c) => c.slug === slug);

    if (!community) {
      return null;
    }

    return community;
  }

  async findParish(): Promise<Community | null> {
    const community = this.communities.find((c) => c.type === 'parish_church');

    if (!community) {
      return null;
    }

    return community;
  }

  async findAll(): Promise<Community[]> {
    return this.communities;
  }

  async create(community: {
    id: string;
    name: string;
    slug: string;
    type: 'chapel' | 'parish_church';
    address: string;
    coverId: string;
    createdAt: string;
  }) {
    this.communities.push(community);
  }

  async save(community: Community) {
    const index = this.communities.findIndex((c) => c.id === community.id);

    if (index >= 0) {
      this.communities[index] = community;
    }
  }

  async delete(id: string) {
    this.communities = this.communities.filter((c) => c.id !== id);
  }
}
