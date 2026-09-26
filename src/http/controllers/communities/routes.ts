import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createCommunity } from './create';
import { editCommunity } from './edit';
import { editCommunityAbout } from './edit-about';
import { editCommunityPatron } from './edit-patron';
import { deleteCommunity } from './delete';
import { listCommunities } from './list';
import { massSchedulesRoutes } from './mass-schedules/routes';
import { communityPhotosRoutes } from './photos/routes';
import { getCommunityBySlug } from './get';

const app = new Hono().basePath('/communities');

app.get('/', listCommunities);
app.get('/:slug', getCommunityBySlug);
app.use(verifyToken);
app.post('/', createCommunity);
app.put('/:id', editCommunity);
app.put('/:id/about', editCommunityAbout);
app.patch('/:id/about', editCommunityAbout);
app.put('/:id/patron', editCommunityPatron);
app.patch('/:id/patron', editCommunityPatron);
app.delete('/:id', deleteCommunity);

app.route('/:id', massSchedulesRoutes);
app.route('/:id', communityPhotosRoutes);

export { app as communitiesRoutes };
