import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { getUrgentAlert } from './get';
import { getActiveUrgentAlert } from './get-active';
import { editUrgentAlert } from './edit';
import { deleteUrgentAlert } from './delete';

const app = new Hono();

// Public route for public site to fetch active alert
app.get('/urgent-alert/active', getActiveUrgentAlert);
app.get('/urgent-alerts/active', getActiveUrgentAlert);

// Protected routes for panel management
app.use('/urgent-alert/*', verifyToken);
app.use('/urgent-alert', verifyToken);
app.use('/urgent-alerts/*', verifyToken);
app.use('/urgent-alerts', verifyToken);

app.get('/urgent-alert', getUrgentAlert);
app.get('/urgent-alerts', getUrgentAlert);

app.put('/urgent-alert', editUrgentAlert);
app.patch('/urgent-alert', editUrgentAlert);
app.put('/urgent-alerts', editUrgentAlert);
app.patch('/urgent-alerts', editUrgentAlert);

app.delete('/urgent-alert', deleteUrgentAlert);
app.delete('/urgent-alerts', deleteUrgentAlert);

export { app as urgentAlertRoutes };
