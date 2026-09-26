import { getAppContext } from '@/http/utils/getAppContext';
import { useEditCommunityAboutSchema } from '@/schemas/use-edit-community-about-schema';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeEditCommunityAboutUseCase } from '@/use-cases/factories/communities/make-edit-community-about-use-case';

export const editCommunityAbout: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);

  const validationSchema = useEditCommunityAboutSchema(t);
  const { id } = params;

  const parsedData = validationSchema.parse(inputs);

  try {
    const editUseCase = makeEditCommunityAboutUseCase(c);

    const { community } = await editUseCase.execute({
      id,
      ...parsedData,
    });

    return c.json({
      community: {
        ...community,
        coverUrl: community.coverId ? `${c.env.S3_API_URL}/${community.coverId}` : undefined,
        patronPhotoUrl: community.patronPhotoId
          ? `${c.env.S3_API_URL}/${community.patronPhotoId}`
          : undefined,
      },
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-community-not-found') }, 404);
    }

    throw err;
  }
};
