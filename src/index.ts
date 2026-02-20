import { Hono } from 'hono';
import { health } from './http/controllers/health';
import { corsSetup } from './http/middlewares/corsSetup';
import { parseBody } from './http/middlewares/parseBody';
import { withDictionary } from './http/middlewares/withDictionary';
import { onAppError } from './http/middlewares/onAppError';
import { userRoutes } from './http/controllers/users/routes';
import { attachmentsRoutes } from './http/controllers/attachments/routes';
import { communitiesRoutes } from './http/controllers/communities/routes';
import { docsRoutes } from './http/controllers/docs/routes';
import { pastoralsRoutes } from './http/controllers/pastorals/routes';
import { clergyRoutes } from './http/controllers/clergy/routes';
import { blogRoutes } from './http/controllers/blog/routes';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get('/health', health);
app.route('/', docsRoutes);

app.use(corsSetup, withDictionary, parseBody);

app.route('/', userRoutes);
app.route('/', attachmentsRoutes);
app.route('/', communitiesRoutes);
app.route('/', pastoralsRoutes);
app.route('/', clergyRoutes);
app.route('/', blogRoutes);

app.onError(onAppError);

export default app;
