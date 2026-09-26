import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { EditCommunityAboutUseCase } from '@/use-cases/communities/edit-community-about';

export function makeEditCommunityAboutUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const editCommunityAboutUseCase = new EditCommunityAboutUseCase(communitiesDaf);

  return editCommunityAboutUseCase;
}
