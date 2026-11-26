import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { registerSiteVisit } from './register';
import { getSiteVisitStats } from './stats';

const app = new Hono().basePath('/site-visits');

// Public lightweight endpoint to register unique daily visits
app.post('/', registerSiteVisit);

// Protected endpoint for admin and secretary dashboards
app.use('*', verifyToken);
app.get('/stats', getSiteVisitStats);

export { app as siteVisitsRoutes };
