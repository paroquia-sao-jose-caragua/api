import type { Community } from "@/entities/community";
import type { CommunitiesDAF } from "@/services/database/communities-daf";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface GetCommunityBySlugResponse {
    community: Community;
}

export class GetCommunityBySlugUseCase {
    constructor(private communitiesDaf: CommunitiesDAF) {}

    async execute(slug: string): Promise<GetCommunityBySlugResponse> {
        const community = await this.communitiesDaf.findBySlug(slug);

        if (!community) {
            throw new ResourceNotFoundError()
        }

        return {community}
    }
}