import { useLoginSchema } from '@/schemas/use-login-schema';
import { getAppContext } from '@/http/utils/getAppContext';
import { createAccessToken } from 'serverless-crypto-utils';
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error';
import { UserSuspendedError } from '@/use-cases/errors/user-suspended-error';
import { setCookie } from 'hono/cookie';
import { makeAuthenticateUseCase } from '@/use-cases/factories/users/make-authenticate-use-case';

export const authenticate: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);

  const validationSchema = useLoginSchema(t);

  const { email, password } = validationSchema.parse(inputs);

  try {
    const authenticateUseCase = makeAuthenticateUseCase(c);
    const { user } = await authenticateUseCase.execute({ email, password });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tokenVersion: user.tokenVersion,
    };

    const token = await createAccessToken({
      encryptionSecret: c.env.ENCRYPTION_SECRET,
      signingSecret: c.env.SIGNING_SECRET,
      payload: {
        user: userPayload,
      },
      expiresInSeconds: 3600, // 1 hour
    });

    const refreshToken = await createAccessToken({
      encryptionSecret: c.env.ENCRYPTION_SECRET,
      signingSecret: c.env.SIGNING_SECRET,
      payload: {
        user: userPayload,
      },
      expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    });

    const isHttps = new URL(c.req.url).protocol === 'https:';
    const secure = isHttps;

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: c.env.DOMAIN,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return c.json({ message: t('invalid-email-or-password') }, 400);
    }

    if (err instanceof UserSuspendedError) {
      return c.json({ message: t('user-suspended-or-inactive') }, 403);
    }

    throw err;
  }
};
