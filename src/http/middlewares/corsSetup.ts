import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export const corsSetup: MiddlewareHandler = cors({
  origin: (origin, c) => {
    const allowedOrigins = [c.env.PANEL_BASE_URL, c.env.SITE_BASE_URL];

    const isAllowed = allowedOrigins.includes(origin ?? '');

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
