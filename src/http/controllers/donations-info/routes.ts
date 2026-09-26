import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { getDonationsInfo } from './get';
import { editDonationsInfo } from './edit';

const app = new Hono();

// Public routes for public site and panel
app.get('/donations', getDonationsInfo);
app.get('/donations-info', getDonationsInfo);
app.get('/contribute', getDonationsInfo);

// Protected routes for editing
app.use('/donations/*', verifyToken);
app.use('/donations', verifyToken);
app.use('/donations-info/*', verifyToken);
app.use('/donations-info', verifyToken);

app.put('/donations', editDonationsInfo);
app.patch('/donations', editDonationsInfo);
app.put('/donations-info', editDonationsInfo);
app.patch('/donations-info', editDonationsInfo);

export { app as donationsInfoRoutes };
