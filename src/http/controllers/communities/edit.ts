import { getAppContext } from '@/http/utils/getAppContext';
import { useCommunitySchema } from '@/schemas/use-community-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { ParishAlreadyExistsError } from '@/use-cases/errors/parish-already-exists-error';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeEditCommunityUseCase } from '@/use-cases/factories/communities/make-edit-community-use-case';

export const editCommunity: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);

  const validationSchema = useCommunitySchema(t);

  const { id } = params;

  const parsedData = validationSchema.parse(inputs);

  try {
    const editUseCase = makeEditCommunityUseCase(c);

    const { community } = await editUseCase.execute({
      id,
      ...parsedData,
    });

    return c.json({
      community: {
        ...community,
        coverUrl: community.coverId ? `${c.env.S3_API_URL}/${community.coverId}` : undefined,
        patronPhotoUrl: community.patronPhotoId ? `${c.env.S3_API_URL}/${community.patronPhotoId}` : undefined,
      },
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-community-not-found') }, 404);
    }

    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('error-community-name-already-in-use') }, 400);
    }

    if (err instanceof ParishAlreadyExistsError) {
      return c.json({ message: t('error-parish-already-exists') }, 400);
    }

    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }

    throw err;
  }
};
