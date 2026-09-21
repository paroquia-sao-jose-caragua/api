import { faker } from '@faker-js/faker';
import type { Community } from '@/entities/community';
import { makeSlug } from '@/use-cases/factories/make-slug';
import { makeId } from '@/use-cases/factories/make-id';

interface MakeCommunityParams extends Partial<Omit<Community, 'coverId'>> {
  coverId?: string;
}

export function makeCommunity({
  coverId,
  ...override
}: MakeCommunityParams = {}): Community {
  const name = faker.lorem.sentence();
  const slug = makeSlug(name);

  return {
    id: makeId(),
    coverId: coverId ?? makeId(),
    name,
    slug,
    type: 'chapel',
    address: faker.location.streetAddress(true),
    createdAt: new Date().toISOString(),
    ...override,
  };
}
