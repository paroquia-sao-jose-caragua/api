import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createAnnouncement } from './create';
import { editAnnouncement } from './edit';
import { deleteAnnouncement } from './delete';
import { listAnnouncements } from './list';
import { listActiveAnnouncements } from './list-active';
import { reorderAnnouncements } from './reorder';

const app = new Hono().basePath('/announcements');

// Public endpoint for active carousel announcements
app.get('/active', listActiveAnnouncements);

// Protected admin endpoints
app.use('*', verifyToken);
app.get('/', listAnnouncements);
app.post('/', createAnnouncement);
app.put('/reorder', reorderAnnouncements);
app.put('/:id', editAnnouncement);
app.delete('/:id', deleteAnnouncement);

export { app as announcementsRoutes };
