import { describe, beforeEach, it, expect } from 'vitest';
import { ulid } from 'serverless-crypto-utils';
import { InMemoryUserDAF } from '../../database/in-memory-users-daf';
import { InMemoryCommunitiesDAF } from '../../database/in-memory-communities-daf';
import { InMemoryAttachmentsDAF } from '../../database/in-memory-attachments-daf';
import { InMemoryCommunityPhotosDAF } from '../../database/in-memory-community-photos-daf';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { ParishAlreadyExistsError } from '@/use-cases/errors/parish-already-exists-error';
import { EditCommunityUseCase } from '@/use-cases/communities/edit-community';
import { makeAttachment } from '../../factories/make-attachment';
import { makeUser } from '../../factories/make-user';
import { makeCommunity } from '../../factories/make-community';
import type { User } from '@/entities/user';

let usersDaf: InMemoryUserDAF;
let communitiesDaf: InMemoryCommunitiesDAF;
let attachmentsDaf: InMemoryAttachmentsDAF;
let communityPhotosDaf: InMemoryCommunityPhotosDAF;
let sut: EditCommunityUseCase;
let user: User;
let coverId: string;

describe('Edit Community Use Case', () => {
  beforeEach(async () => {
    communitiesDaf = new InMemoryCommunitiesDAF();
    attachmentsDaf = new InMemoryAttachmentsDAF();
    communityPhotosDaf = new InMemoryCommunityPhotosDAF();
    usersDaf = new InMemoryUserDAF();
    sut = new EditCommunityUseCase(communitiesDaf, attachmentsDaf, communityPhotosDaf);

    user = await usersDaf.create(await makeUser());
    coverId = ulid();
    await attachmentsDaf.create(
      makeAttachment({ id: coverId, userId: user.id }),
    );
  });

  it('should be able to edit a community with all fields and photos', async () => {
    const community = makeCommunity({
      coverId,
    });

    await communitiesDaf.create(community);

    const patronPhotoId = ulid();
    await attachmentsDaf.create(
      makeAttachment({ id: patronPhotoId, userId: user.id }),
    );

    const galleryPhotoId = ulid();
    await attachmentsDaf.create(
      makeAttachment({ id: galleryPhotoId, userId: user.id }),
    );

    const { community: newCommunity } = await sut.execute({
      id: community.id,
      name: 'Chapel of St. Mary',
      type: 'chapel',
      address: '789 New St, Othertown, USA',
      coverId,
      heroSubtitle: 'Comunidade vibrante',
      aboutTitle: 'Nossa História',
      aboutDescription: 'História detalhada',
      historySummary: 'Resumo histórico',
      patronName: 'Nossa Senhora',
      patronDescription: 'Mãe de Jesus',
      patronPhotoId,
      photos: [
        {
          photoId: galleryPhotoId,
          caption: 'Foto da Fachada',
          orderIndex: 0,
        },
      ],
    });

    expect(newCommunity).toMatchObject({
      name: 'Chapel of St. Mary',
      type: 'chapel',
      address: '789 New St, Othertown, USA',
      coverId,
      heroSubtitle: 'Comunidade vibrante',
      patronName: 'Nossa Senhora',
      patronPhotoId,
    });

    const savedPhotos = await communityPhotosDaf.findByCommunityId(community.id);
    expect(savedPhotos).toHaveLength(1);
    expect(savedPhotos[0].caption).toBe('Foto da Fachada');
  });

  it('should not be able to save a community with same name twice', async () => {
    await communitiesDaf.create(
      makeCommunity({
        name: 'Chapel of St. Mary',
        coverId,
      }),
    );

    const community = makeCommunity({
      name: 'Chapel of St. Anna',
      coverId,
    });

    await communitiesDaf.create(community);

    await expect(() =>
      sut.execute({
        id: community.id,
        name: 'Chapel of St. Mary',
        type: 'chapel' as const,
        address: '456 Old St, Anytown, USA',
        coverId,
      }),
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError);
  });

  it('should not be able to edit a community as parish twice', async () => {
    await communitiesDaf.create(
      makeCommunity({
        name: 'Parish of St. Mary',
        type: 'parish_church',
        coverId,
      }),
    );

    const community = makeCommunity({
      coverId,
    });

    await communitiesDaf.create(community);

    await expect(() =>
      sut.execute({
        id: community.id,
        name: community.name,
        type: 'parish_church',
        address: '456 Old St, Anytown, USA',
        coverId,
      }),
    ).rejects.toBeInstanceOf(ParishAlreadyExistsError);
  });
});
