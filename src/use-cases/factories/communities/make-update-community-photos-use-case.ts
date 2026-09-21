import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { D1CommunityPhotosDAF } from '@/services/database/d1/d1-community-photos-daf';
import { UpdateCommunityPhotosUseCase } from '@/use-cases/communities/update-community-photos';

export function makeUpdateCommunityPhotosUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  const communityPhotosDaf = new D1CommunityPhotosDAF(c.env.DB);

  return new UpdateCommunityPhotosUseCase(
    communitiesDaf,
    attachmentsDaf,
    communityPhotosDaf,
  );
}
