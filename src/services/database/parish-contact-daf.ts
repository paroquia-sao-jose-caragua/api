import type { ParishContact } from '@/entities/parish-contact';

export interface ParishContactDAF {
  get(): Promise<ParishContact | null>;
  save(data: {
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
  }): Promise<ParishContact>;
}
