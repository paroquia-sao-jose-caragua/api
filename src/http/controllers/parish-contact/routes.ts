import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { getParishContact } from './get';
import { editParishContact } from './edit';

const app = new Hono();

// Public routes for public site and panel
app.get('/parish-contact', getParishContact);
app.get('/secretariat', getParishContact);

// Protected routes for editing
app.use('/parish-contact/*', verifyToken);
app.use('/parish-contact', verifyToken);
app.use('/secretariat/*', verifyToken);
app.use('/secretariat', verifyToken);

app.put('/parish-contact', editParishContact);
app.patch('/parish-contact', editParishContact);
app.put('/secretariat', editParishContact);
app.patch('/secretariat', editParishContact);

export { app as parishContactRoutes };
