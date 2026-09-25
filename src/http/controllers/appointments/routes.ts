import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { verifyUserRole } from '@/http/middlewares/verifyUserRole';
import { listAppointmentServices } from './list-services';
import { listPastoralAgents } from './list-agents';
import { getAvailableSlots } from './get-available-slots';
import { createAppointment } from './create-appointment';
import { getAppointmentByToken } from './get-appointment-by-token';
import { cancelAppointmentByToken } from './cancel-appointment-by-token';
import { listAppointments } from './list-appointments';
import { updateAppointmentStatus } from './update-appointment-status';
import {
  getPastoralAgent,
  savePastoralAgent,
  deletePastoralAgent,
  getAgentAvailabilities,
  saveAgentAvailabilities,
  getAgentBlockedDates,
  addAgentBlockedDate,
  removeAgentBlockedDate,
} from './manage-agents';

import {
  getAppointmentSettings,
  updateAppointmentSettings,
} from './appointment-settings';

export const appointmentsRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Public routes for the website and faithful
appointmentsRoutes.get('/appointment-settings', getAppointmentSettings);
appointmentsRoutes.get('/appointment-services', listAppointmentServices);
appointmentsRoutes.get('/pastoral-agents', listPastoralAgents);
appointmentsRoutes.get('/pastoral-agents/:id', getPastoralAgent);
appointmentsRoutes.get('/appointments/available-slots', getAvailableSlots);
appointmentsRoutes.post('/appointments', createAppointment);
appointmentsRoutes.get('/appointments/track/:token', getAppointmentByToken);
appointmentsRoutes.patch(
  '/appointments/track/:token/cancel',
  cancelAppointmentByToken
);

// Protected routes (Admin, Secretary, Pastoral Agents)
appointmentsRoutes.get('/appointments', verifyToken, listAppointments);
appointmentsRoutes.patch(
  '/appointments/:id/status',
  verifyToken,
  updateAppointmentStatus
);
appointmentsRoutes.put(
  '/appointment-settings',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  updateAppointmentSettings
);

appointmentsRoutes.post(
  '/pastoral-agents',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  savePastoralAgent
);
appointmentsRoutes.put(
  '/pastoral-agents/:id',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  savePastoralAgent
);
appointmentsRoutes.delete(
  '/pastoral-agents/:id',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  deletePastoralAgent
);

appointmentsRoutes.get(
  '/pastoral-agents/:id/availabilities',
  verifyToken,
  getAgentAvailabilities
);
appointmentsRoutes.put(
  '/pastoral-agents/:id/availabilities',
  verifyToken,
  saveAgentAvailabilities
);

appointmentsRoutes.get(
  '/pastoral-agents/:id/blocked-dates',
  verifyToken,
  getAgentBlockedDates
);
appointmentsRoutes.post(
  '/pastoral-agents/:id/blocked-dates',
  verifyToken,
  addAgentBlockedDate
);
appointmentsRoutes.delete(
  '/pastoral-agents/:id/blocked-dates/:blockId',
  verifyToken,
  removeAgentBlockedDate
);
