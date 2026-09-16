import { Hono } from 'hono';
import { getDailyLiturgy } from './get-daily-liturgy';

const app = new Hono().basePath('/liturgy');

// Public endpoint for daily liturgy
app.get('/', getDailyLiturgy);

export { app as liturgyRoutes };
