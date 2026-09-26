import { Hono } from 'hono';
import { updateCommunityPhotos } from './update';

const app = new Hono().basePath('/photos');

app.put('/', updateCommunityPhotos);

export { app as communityPhotosRoutes };
