import type { ClergyDAF } from '@/services/database/clergy-daf';
import type { AttachmentsDAF } from '@/services/database/attachments-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface DeleteClergyUseCaseRequest {
  clergyId: string;
}

export class DeleteClergyUseCase {
  constructor(
    private clergyDaf: ClergyDAF,
    private attachmentsDaf: AttachmentsDAF,
  ) {}

  async execute({ clergyId }: DeleteClergyUseCaseRequest): Promise<void> {
    const clergy = await this.clergyDaf.findById(clergyId);

    if (!clergy) {
      throw new ResourceNotFoundError();
    }

    if (clergy.photoId) {
      await this.attachmentsDaf.save(clergy.photoId, { status: 'deleted' });
    }
    await this.clergyDaf.delete(clergyId);
  }
}
