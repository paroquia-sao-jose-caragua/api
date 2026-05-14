import { Hono } from 'hono';
import { listCalendar } from './list';

const app = new Hono().basePath('/calendar');

app.get('/', listCalendar);

export { app as calendarRoutes };
