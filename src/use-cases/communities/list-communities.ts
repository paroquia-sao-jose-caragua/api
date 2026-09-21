import type { Community } from '@/entities/community';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';

interface ListCommunitiesUseCaseResponse {
  communities: Community[];
}

export class ListCommunitiesUseCase {
  constructor(
    private communitiesDaf: CommunitiesDAF,
    private massSchedulesDaf: MassSchedulesDAF,
  ) {}

  async execute(): Promise<ListCommunitiesUseCaseResponse> {
    const [communities, allMassSchedules] = await Promise.all([
      this.communitiesDaf.findAll(),
      this.massSchedulesDaf.findAll(),
    ]);

    const activeOrdinaryMassSchedules = allMassSchedules.filter(
      (ms) => ms.active && ms.type === 'ordinary',
    );

    const communitiesWithSchedules = communities.map((community) => {
      const communityMassSchedules = activeOrdinaryMassSchedules.filter(
        (schedule) => schedule.communityId === community.id,
      );

      return {
        ...community,
        massSchedules: communityMassSchedules,
      };
    });

    return { communities: communitiesWithSchedules };
  }
}
