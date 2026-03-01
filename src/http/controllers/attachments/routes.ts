import { Hono } from 'hono';
import { imagesRoutes } from './images/routes';
import { getAttachment } from './get';

const app = new Hono().basePath('/attachments');

app.get('/:filename', getAttachment);
app.route('/', imagesRoutes);

export { app as attachmentsRoutes };
