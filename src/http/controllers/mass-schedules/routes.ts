import { Hono } from 'hono';
import { editMassSchedule } from './edit';
import { deleteMassSchedule } from './delete';
import { createMassScheduleException } from './exceptions/create';
import { deleteMassScheduleException } from './exceptions/delete';
import { verifyToken } from '@/http/middlewares/verifyToken';

const app = new Hono().basePath('/mass-schedules');

app.use(verifyToken);

app.put('/:id', editMassSchedule);
app.delete('/:id', deleteMassSchedule);
app.post('/:id/exceptions', createMassScheduleException);
app.delete('/exceptions/:id', deleteMassScheduleException);

export { app as massSchedulesRoutes };
