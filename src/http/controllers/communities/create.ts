import { getAppContext } from '@/http/utils/getAppContext';
import { useCommunitySchema } from '@/schemas/use-community-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { ParishAlreadyExistsError } from '@/use-cases/errors/parish-already-exists-error';
import { makeCreateCommunityUseCase } from '@/use-cases/factories/communities/make-create-community-use-case';

export const createCommunity: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useCommunitySchema(t);

  const { name, type, address, coverId } = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateCommunityUseCase(c);

    const { community } = await createUseCase.execute({
      name,
      type,
      address,
      coverId,
    });

    return c.json(
      {
        community: {
          ...community,
          coverUrl: c.env.S3_API_URL.concat('/', community.coverId),
        },
      },
      201,
    );
  } catch (err) {
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
