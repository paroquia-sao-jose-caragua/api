import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { GetCommunityBySlugUseCase } from '@/use-cases/communities/get-community-by-slug';

export function makeGetCommunityUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const useCase = new GetCommunityBySlugUseCase(
    communitiesDaf,
  );

  return useCase;
}
