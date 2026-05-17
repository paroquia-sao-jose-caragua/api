import { Hono } from 'hono';
import { createEventSchedule } from './create';
import { editEventSchedule } from './edit';
import { deleteEventSchedule } from './delete';
import { getEventSchedule } from './get';

const app = new Hono().basePath('/event-schedules');

app.post('/', createEventSchedule);
app.put('/:id', editEventSchedule);
app.delete('/:id', deleteEventSchedule);

app.get('/:id', getEventSchedule);

export { app as eventSchedulesRoutes };
