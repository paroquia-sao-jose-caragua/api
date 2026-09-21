import type { Community } from "@/entities/community";
import type { CommunitiesDAF } from "@/services/database/communities-daf";
import type { CommunityPhotosDAF } from "@/services/database/community-photos-daf";
import type { MassSchedulesDAF } from "@/services/database/mass-schedules-daf";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface GetCommunityBySlugResponse {
    community: Community;
}

export class GetCommunityBySlugUseCase {
    constructor(
        private communitiesDaf: CommunitiesDAF,
        private communityPhotosDaf: CommunityPhotosDAF,
        private massSchedulesDaf: MassSchedulesDAF,
    ) {}

    async execute(slug: string): Promise<GetCommunityBySlugResponse> {
        const community = await this.communitiesDaf.findBySlug(slug);

        if (!community) {
            throw new ResourceNotFoundError();
        }

        const [photos, massSchedules] = await Promise.all([
            this.communityPhotosDaf.findByCommunityId(community.id),
            this.massSchedulesDaf.findMany({ communityId: community.id }),
        ]);

        return {
            community: {
                ...community,
                photos,
                massSchedules: massSchedules.filter((ms) => ms.active && ms.type !== 'solemnity'),
            },
        };
    }
}