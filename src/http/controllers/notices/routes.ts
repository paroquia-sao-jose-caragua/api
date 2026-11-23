import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createNotice } from './create';
import { editNotice } from './edit';
import { deleteNotice } from './delete';
import { getNotice } from './get';
import { listNotices } from './list';
import { listActiveNotices } from './list-active';

const app = new Hono().basePath('/notices');

// Public endpoints for notice board and header bell
app.get('/active', listActiveNotices);
app.get('/:id', getNotice);

// Protected admin endpoints
app.use('*', verifyToken);
app.get('/', listNotices);
app.post('/', createNotice);
app.put('/:id', editNotice);
app.delete('/:id', deleteNotice);

export { app as noticesRoutes };
