import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { getParishContact } from './get';
import { editParishContact } from './edit';

const app = new Hono().basePath('/parish-contact');

app.get('/', getParishContact);
app.use(verifyToken);
app.put('/', editParishContact);
app.patch('/', editParishContact);

export { app as parishContactRoutes };
