import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createClergy } from './create';
import { editClergy } from './edit';
import { deleteClergy } from './delete';
import { listClergy } from './list';

const app = new Hono().basePath('/clergy');

// Public route for public site and panel reading
app.get('/', listClergy);

// Protected routes for editing
app.use('*', verifyToken);
app.post('/', createClergy);
app.put('/:id', editClergy);
app.patch('/:id', editClergy);
app.put('/', editClergy);
app.patch('/', editClergy);
app.delete('/:id', deleteClergy);
app.delete('/', deleteClergy);

export { app as clergyRoutes };
