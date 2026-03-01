import { useUserSchema } from '@/schemas/use-user-schema';
import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { makeRegisterUseCase } from '@/use-cases/factories/users/make-register-use-case';

export const register: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useUserSchema(t);

  const { name, email, password, role } = validationSchema.parse(inputs);

  try {
    const registerUseCase = makeRegisterUseCase(c);

    const { user } = await registerUseCase.execute({
      name,
      email,
      password,
      role,
    });

    return c.json({ user }, 201);
  } catch (err) {
    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('error-email-already-exists') }, 409);
    }

    throw err;
  }
};
