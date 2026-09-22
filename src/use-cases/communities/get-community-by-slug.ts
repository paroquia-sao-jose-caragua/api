import type { Community } from "@/entities/community";
import type { CommunitiesDAF } from "@/services/database/communities-daf";
import type { CommunityPhotosDAF } from "@/services/database/community-photos-daf";
import type { MassSchedulesDAF } from "@/services/database/mass-schedules-daf";
import type { ParishContactDAF } from "@/services/database/parish-contact-daf";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface GetCommunityBySlugResponse {
    community: Community;
}

export class GetCommunityBySlugUseCase {
    constructor(
        private communitiesDaf: CommunitiesDAF,
        private communityPhotosDaf: CommunityPhotosDAF,
        private massSchedulesDaf: MassSchedulesDAF,
        private parishContactDaf: ParishContactDAF,
    ) {}

    async execute(slug: string): Promise<GetCommunityBySlugResponse> {
        const community = await this.communitiesDaf.findBySlug(slug);

        if (!community) {
            throw new ResourceNotFoundError();
        }

        const [photos, massSchedules, parishContact] = await Promise.all([
            this.communityPhotosDaf.findByCommunityId(community.id),
            this.massSchedulesDaf.findMany({ communityId: community.id }),
            this.parishContactDaf.get(),
        ]);

        return {
            community: {
                ...community,
                address: parishContact?.address || community.address,
                phone: parishContact?.phone || community.phone,
                email: parishContact?.email || community.email,
                officeHours: parishContact?.officeHours || community.officeHours,
                photos,
                massSchedules: massSchedules.filter((ms) => ms.active && ms.type !== 'solemnity'),
            },
        };
    }
}