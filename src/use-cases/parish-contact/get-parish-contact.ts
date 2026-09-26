import type { ParishContact } from '@/entities/parish-contact';
import type { ParishContactDAF } from '@/services/database/parish-contact-daf';

interface GetParishContactUseCaseResponse {
  contact: ParishContact | null;
}

export class GetParishContactUseCase {
  constructor(private parishContactDaf: ParishContactDAF) {}

  async execute(): Promise<GetParishContactUseCaseResponse> {
    const contact = await this.parishContactDaf.get();

    return { contact };
  }
}
