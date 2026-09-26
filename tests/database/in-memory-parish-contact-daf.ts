import type { ParishContact } from '@/entities/parish-contact';
import type { ParishContactDAF } from '@/services/database/parish-contact-daf';

export class InMemoryParishContactDAF implements ParishContactDAF {
  public contact: ParishContact | null = null;

  async get(): Promise<ParishContact | null> {
    return this.contact;
  }

  async save(data: {
    id: string;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    officeHours?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    facebookUrl?: string | null;
    whatsappUrl?: string | null;
    updatedAt: string;
    createdAt?: string;
  }): Promise<ParishContact> {
    const contact: ParishContact = {
      id: data.id || this.contact?.id || 'primary',
      phone: data.phone ?? this.contact?.phone ?? undefined,
      whatsapp: data.whatsapp ?? this.contact?.whatsapp ?? undefined,
      email: data.email ?? this.contact?.email ?? undefined,
      address: data.address ?? this.contact?.address ?? undefined,
      officeHours: data.officeHours ?? this.contact?.officeHours ?? undefined,
      instagramUrl: data.instagramUrl ?? this.contact?.instagramUrl ?? undefined,
      youtubeUrl: data.youtubeUrl ?? this.contact?.youtubeUrl ?? undefined,
      facebookUrl: data.facebookUrl ?? this.contact?.facebookUrl ?? undefined,
      whatsappUrl: data.whatsappUrl ?? this.contact?.whatsappUrl ?? undefined,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt || this.contact?.createdAt || new Date().toISOString(),
    };

    this.contact = contact;

    return contact;
  }
}
