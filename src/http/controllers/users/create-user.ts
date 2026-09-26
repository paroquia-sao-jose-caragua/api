import { getAppContext } from '@/http/utils/getAppContext';
import { useCreateUserSchema } from '@/schemas/use-create-user-schema';
import { makeCreateUserUseCase } from '@/use-cases/factories/users/make-create-user-use-case';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';

export const createUser: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);

  const validationSchema = useCreateUserSchema(t);
  const data = validationSchema.parse(inputs);

  try {
    const createUserUseCase = makeCreateUserUseCase(c);
    const { user } = await createUserUseCase.execute({
      ...data,
      panelBaseUrl: c.env.PANEL_BASE_URL || 'http://localhost:3000',
    });

    return c.json({ user }, 201);
  } catch (err) {
    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('error-email-already-exists') }, 409);
    }

    throw err;
  }
};
