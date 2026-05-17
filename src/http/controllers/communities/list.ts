import { makeListCommunitiesUseCase } from '@/use-cases/factories/communities/make-list-communities-use-case';

export const listCommunities: ControllerFn = async (c) => {
  const listCommunitiesUseCase = makeListCommunitiesUseCase(c);

  const { communities } = await listCommunitiesUseCase.execute();

  return c.json({
    communities: communities
      .sort(
        (a, b) =>
          (a.type === 'parish_church' && b.type === 'chapel' ? -1 : 1) ||
          a.name.localeCompare(b.name),
      )
      .map((community) => ({
        ...community,
        coverUrl: c.env.S3_API_URL.concat('/', community.coverId),
      })),
  });
};
