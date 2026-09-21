import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { D1CommunityPhotosDAF } from '@/services/database/d1/d1-community-photos-daf';
import { D1MassSchedulesDAF } from '@/services/database/d1/d1-mass-schedules-daf';
import { GetCommunityBySlugUseCase } from '@/use-cases/communities/get-community-by-slug';

export function makeGetCommunityUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const communityPhotosDaf = new D1CommunityPhotosDAF(c.env.DB);
  const massSchedulesDaf = new D1MassSchedulesDAF(c.env.DB);

  const useCase = new GetCommunityBySlugUseCase(
    communitiesDaf,
    communityPhotosDaf,
    massSchedulesDaf,
  );

  return useCase;
}
