import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { D1CommunityPhotosDAF } from '@/services/database/d1/d1-community-photos-daf';
import { EditCommunityUseCase } from '@/use-cases/communities/edit-community';

export function makeEditCommunityUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);
  const communityPhotosDaf = new D1CommunityPhotosDAF(c.env.DB);
  const editCommunityUseCase = new EditCommunityUseCase(
    communitiesDaf,
    attachmentsDaf,
    communityPhotosDaf,
  );

  return editCommunityUseCase;
}
