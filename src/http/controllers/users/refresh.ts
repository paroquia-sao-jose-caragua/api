import { getAppContext } from '@/http/utils/getAppContext';
import { getCookie, setCookie } from 'hono/cookie';
import {
  createAccessToken,
  verifyAccessTokenSafe,
} from 'serverless-crypto-utils/access-token';

export const refresh: ControllerFn = async (c) => {
  const { t } = getAppContext(c);

  const refreshToken = getCookie(c, 'refreshToken');

  if (!refreshToken) {
    return c.json(
      {
        error: t('required-refresh-token'),
      },
      401,
    );
  }

  const refreshResult = await verifyAccessTokenSafe({
    accessToken: refreshToken,
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
  });

  if (!refreshResult.success) {
    return c.json(
      {
        error: t('invalid-refresh-token-or-expired'),
      },
      401,
    );
  }

  const data = JSON.parse(refreshResult.data) as { user?: unknown };
  const user = data.user;

  if (!user) {
    return c.json(
      {
        error: t('invalid-refresh-token-or-expired'),
      },
      401,
    );
  }

  const isHttps = new URL(c.req.url).protocol === 'https:';
  const secure = isHttps;

  const token = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user,
    },
    expiresInSeconds: 3600, // 1 hour
  });

  const newRefreshToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user,
    },
    expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
  });

  setCookie(c, 'refreshToken', newRefreshToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    domain: secure ? 'localhost' : '.paroquiasaojosecaragua.com.br',
  });

  return c.json({ token });
};
