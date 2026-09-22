import { getAppContext } from '@/http/utils/getAppContext';
import { useClergySchema } from '@/schemas/use-clergy-schema';
import { makeEditClergyUseCase } from '@/use-cases/factories/clergy/make-edit-clergy-use-case';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

export const editClergy: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);

  const validationSchema = useClergySchema(t);

  const data = validationSchema.parse(inputs);

  const id = params.id || (inputs as Record<string, unknown>).id as string;

  try {
    const editUseCase = makeEditClergyUseCase(c);

    const { clergy } = await editUseCase.execute({
      clergyId: id,
      name: data.name,
      title: data.title,
      position: data.position,
      roleName: data.roleName,
      shortIntro: data.shortIntro,
      bio: data.bio,
      orderIndex: data.orderIndex,
      isMain: data.isMain,
      photoId: data.photoId,
    });

    return c.json({
      clergy: {
        ...clergy,
        photoUrl: clergy.photoId
          ? `${c.env.S3_API_URL}/${clergy.photoId}`
          : null,
      },
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-clergy-not-found') }, 404);
    }

    throw err;
  }
};
