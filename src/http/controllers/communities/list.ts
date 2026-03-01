import { makeListCommunitiesUseCase } from '@/use-cases/factories/communities/make-list-communities-use-case';

export const listCommunities: ControllerFn = async (c) => {
  const listCommunitiesUseCase = makeListCommunitiesUseCase(c);

  const { communities } = await listCommunitiesUseCase.execute();

  return c.json({
    communities: communities.map((community) => ({
      ...community,
      coverUrl: c.env.S3_API_URL.concat('/', community.coverId),
    })),
  });
};
