import { getAppContext } from '@/http/utils/getAppContext';
import { useForgotPasswordSchema } from '@/schemas/use-forgot-password-schema';
import { makeForgotPasswordUseCase } from '@/use-cases/factories/users/make-forgot-password-use-case';

export const forgotPassword: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);

  const validationSchema = useForgotPasswordSchema(t);
  const { email } = validationSchema.parse(inputs);

  const forgotPasswordUseCase = makeForgotPasswordUseCase(c);
  await forgotPasswordUseCase.execute({
    email,
    panelBaseUrl: c.env.PANEL_BASE_URL || 'http://localhost:3000',
  });

  return c.json({
    message: t('forgot-password-email-sent'),
  });
};
