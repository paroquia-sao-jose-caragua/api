import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { D1MassSchedulesDAF } from '@/services/database/d1/d1-mass-schedules-daf';
import { ListCommunitiesUseCase } from '@/use-cases/communities/list-communities';

export function makeListCommunitiesUseCase(c: DomainContext) {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const massSchedulesDaf = new D1MassSchedulesDAF(c.env.DB);
  const useCase = new ListCommunitiesUseCase(communitiesDaf, massSchedulesDaf);

  return useCase;
}
