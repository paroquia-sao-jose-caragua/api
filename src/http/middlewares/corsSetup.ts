import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export const corsSetup: MiddlewareHandler = cors({
  origin: (origin, c) => {
    if (!origin) return null;

    const rawOrigins = [c.env.PANEL_BASE_URL, c.env.SITE_BASE_URL].filter(
      Boolean,
    ) as string[];

    const allowedOrigins = rawOrigins
      .flatMap((item) => item.split(','))
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);

    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    const isAllowed = allowedOrigins.includes(normalizedOrigin);

    console.log({isAllowed, allowedOrigins, normalizedOrigin})

    return isAllowed ? origin : null;
  },
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept-Language',
    'X-Timezone-Offset',
    'X-Timezone',
    'Cache-Control',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
  maxAge: 600,
  credentials: true,
});
