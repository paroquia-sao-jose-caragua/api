import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createCommunity } from './create';
import { editCommunity } from './edit';
import { deleteCommunity } from './delete';
import { listCommunities } from './list';
import { massSchedulesRoutes } from './mass-schedules/routes';
import { getCommunityBySlug } from './get';

const app = new Hono().basePath('/communities');

app.use(verifyToken);
app.get('/', listCommunities);
app.get('/:slug', getCommunityBySlug);
app.post('/', createCommunity);
app.put('/:id', editCommunity);
app.delete('/:id', deleteCommunity);

app.route('/:id', massSchedulesRoutes);

export { app as communitiesRoutes };
