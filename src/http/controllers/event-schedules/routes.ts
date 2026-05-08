import { Hono } from 'hono';
import { createEventSchedule } from './create';
import { editEventSchedule } from './edit';
import { deleteEventSchedule } from './delete';

const app = new Hono().basePath('/event-schedules');

app.post('/', createEventSchedule);
app.patch('/', editEventSchedule);
app.delete('/', deleteEventSchedule);

export { app as eventSchedulesRoutes };
