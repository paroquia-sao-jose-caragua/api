import { getAppContext } from '@/http/utils/getAppContext';
import { useUpdateCommunityPhotosSchema } from '@/schemas/use-update-community-photos-schema';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeUpdateCommunityPhotosUseCase } from '@/use-cases/factories/communities/make-update-community-photos-use-case';

export const updateCommunityPhotos: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);
  const { id } = params;

  const validationSchema = useUpdateCommunityPhotosSchema(t);
  const { photos } = validationSchema.parse(inputs);

  try {
    const updateUseCase = makeUpdateCommunityPhotosUseCase(c);
    const result = await updateUseCase.execute({
      communityId: id,
      photos,
    });

    return c.json({
      photos: result.photos.map((p) => ({
        ...p,
        photoUrl: `${c.env.S3_API_URL}/${p.photoId}`,
      })),
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-community-not-found') }, 404);
    }
    throw err;
  }
};
