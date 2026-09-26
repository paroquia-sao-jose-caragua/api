import type { User } from '@/entities/user';
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

  const data = JSON.parse(refreshResult.data) as { user: User };
  const user = data.user;

  if (!user || !user.id) {
    return c.json(
      {
        error: t('invalid-refresh-token-or-expired'),
      },
      401,
    );
  }

  // Validar se o usuário foi suspenso ou se o token_version foi incrementado
  if (c.env.DB) {
    const dbUser = await c.env.DB
      .prepare(
        'SELECT status, token_version, role, name, email FROM users WHERE id = ?',
      )
      .bind(user.id)
      .first<{
        status: string;
        token_version: number;
        role: string;
        name: string;
        email: string;
      }>();

    if (!dbUser || dbUser.status === 'suspended') {
      return c.json(
        {
          error: t('user-suspended-or-inactive'),
        },
        401,
      );
    }

    if (
      user.tokenVersion !== undefined &&
      dbUser.token_version > user.tokenVersion
    ) {
      return c.json(
        {
          error: t('invalid-refresh-token-or-expired'),
        },
        401,
      );
    }

    user.role = dbUser.role as any;
    user.status = dbUser.status as any;
    user.tokenVersion = dbUser.token_version;
    user.name = dbUser.name;
    user.email = dbUser.email;
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
};
