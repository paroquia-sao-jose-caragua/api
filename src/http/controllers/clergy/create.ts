import { getAppContext } from '@/http/utils/getAppContext';
import { useClergySchema } from '@/schemas/use-clergy-schema';
import { makeCreateClergyUseCase } from '@/use-cases/factories/clergy/make-create-clergy-use-case';

export const createClergy: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useClergySchema(t);

  const data = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateClergyUseCase(c);

    const { clergy } = await createUseCase.execute({
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

    return c.json(
      {
        clergy: {
          ...clergy,
          photoUrl: clergy.photoId
            ? `${c.env.S3_API_URL}/${clergy.photoId}`
            : null,
        },
      },
      201,
    );
  } catch (err) {
    throw err;
  }
};
