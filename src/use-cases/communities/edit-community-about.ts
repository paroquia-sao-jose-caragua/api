import type { Community } from '@/entities/community';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditCommunityAboutUseCaseRequest {
  id: string;
  heroSubtitle?: string | null;
  aboutTitle?: string | null;
  aboutDescription?: string | null;
  historySummary?: string | null;
}

interface EditCommunityAboutUseCaseResponse {
  community: Community;
}

export class EditCommunityAboutUseCase {
  constructor(private communitiesDaf: CommunitiesDAF) {}

  async execute({
    id,
    heroSubtitle,
    aboutTitle,
    aboutDescription,
    historySummary,
  }: EditCommunityAboutUseCaseRequest): Promise<EditCommunityAboutUseCaseResponse> {
    const community = await this.communitiesDaf.findById(id);

    if (!community) {
      throw new ResourceNotFoundError();
    }

    if (heroSubtitle !== undefined) community.heroSubtitle = heroSubtitle;
    if (aboutTitle !== undefined) community.aboutTitle = aboutTitle;
    if (aboutDescription !== undefined) community.aboutDescription = aboutDescription;
    if (historySummary !== undefined) community.historySummary = historySummary;
    community.updatedAt = new Date().toISOString();

    await this.communitiesDaf.save(community);

    return { community };
  }
}
