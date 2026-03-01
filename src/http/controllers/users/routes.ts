import { Hono } from 'hono';
import { register } from './register';
import { refresh } from './refresh';
import { authenticate } from './authenticate';
import { verifyUserRole } from '@/http/middlewares/verifyUserRole';
import { verifyToken } from '@/http/middlewares/verifyToken';

const app = new Hono();

app.post('/sessions', authenticate);
app.post('/token/refresh', refresh);

app.use('/users/*', verifyToken);
app.post('/users', verifyUserRole('admin'), register);

export { app as userRoutes };
