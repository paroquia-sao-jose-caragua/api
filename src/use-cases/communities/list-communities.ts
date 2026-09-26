import type { Community } from '@/entities/community';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';
import type { ParishContactDAF } from '@/services/database/parish-contact-daf';

interface ListCommunitiesUseCaseResponse {
  communities: Community[];
}

export class ListCommunitiesUseCase {
  constructor(
    private communitiesDaf: CommunitiesDAF,
    private massSchedulesDaf: MassSchedulesDAF,
    private parishContactDaf: ParishContactDAF,
  ) {}

  async execute(): Promise<ListCommunitiesUseCaseResponse> {
    const [communities, allMassSchedules, parishContact] = await Promise.all([
      this.communitiesDaf.findAll(),
      this.massSchedulesDaf.findAll(),
      this.parishContactDaf.get(),
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
        phone: parishContact?.phone,
        email: parishContact?.email,
        officeHours: parishContact?.officeHours,
        massSchedules: communityMassSchedules,
      };
    });

    return { communities: communitiesWithSchedules };
  }
}
