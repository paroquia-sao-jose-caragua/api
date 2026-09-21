import type { ParishContact } from '@/entities/parish-contact';
import type { ParishContactDAF } from '@/services/database/parish-contact-daf';

interface EditParishContactUseCaseRequest {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  officeHours?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
  whatsappUrl?: string | null;
}

interface EditParishContactUseCaseResponse {
  contact: ParishContact;
}

export class EditParishContactUseCase {
  constructor(private parishContactDaf: ParishContactDAF) {}

  async execute(
    data: EditParishContactUseCaseRequest,
  ): Promise<EditParishContactUseCaseResponse> {
    const existing = await this.parishContactDaf.get();

    const contact = await this.parishContactDaf.save({
      id: existing?.id || 'primary',
      phone: data.phone !== undefined ? data.phone : existing?.phone,
      whatsapp: data.whatsapp !== undefined ? data.whatsapp : existing?.whatsapp,
      email: data.email !== undefined ? data.email : existing?.email,
      address: data.address !== undefined ? data.address : existing?.address,
      officeHours: data.officeHours !== undefined ? data.officeHours : existing?.officeHours,
      instagramUrl: data.instagramUrl !== undefined ? data.instagramUrl : existing?.instagramUrl,
      youtubeUrl: data.youtubeUrl !== undefined ? data.youtubeUrl : existing?.youtubeUrl,
      facebookUrl: data.facebookUrl !== undefined ? data.facebookUrl : existing?.facebookUrl,
      whatsappUrl: data.whatsappUrl !== undefined ? data.whatsappUrl : existing?.whatsappUrl,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt,
    });

    return { contact };
  }
}
