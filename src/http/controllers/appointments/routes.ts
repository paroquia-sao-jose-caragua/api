import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { verifyUserRole } from '@/http/middlewares/verifyUserRole';
import { listAppointmentServices } from './list-services';
import { listPastoralAgents } from './list-agents';
import { getAvailableSlots } from './get-available-slots';
import { getInternalAvailableSlots } from './get-internal-available-slots';
import { createAppointment } from './create-appointment';
import { createInternalAppointment } from './create-internal-appointment';
import { getAppointmentByToken } from './get-appointment-by-token';
import { cancelAppointmentByToken } from './cancel-appointment-by-token';
import { listAppointments } from './list-appointments';
import { updateAppointmentStatus } from './update-appointment-status';
import {
  getMyPastoralAgent,
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
import {
  getAppointmentService,
  saveAppointmentService,
  deleteAppointmentService,
} from './manage-services';

export const appointmentsRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Public routes for website
appointmentsRoutes.get('/appointment-settings', getAppointmentSettings);
appointmentsRoutes.get('/appointment-services', listAppointmentServices);
appointmentsRoutes.get('/appointment-services/:id', getAppointmentService);

appointmentsRoutes.get('/pastoral-agents', listPastoralAgents);
appointmentsRoutes.get('/pastoral-agents/me', verifyToken, getMyPastoralAgent);
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
appointmentsRoutes.post(
  '/appointments/internal',
  verifyToken,
  verifyUserRole(['admin', 'secretary', 'pastoral_agent']),
  createInternalAppointment
);
appointmentsRoutes.get(
  '/appointments/internal/available-slots',
  verifyToken,
  verifyUserRole(['admin', 'secretary', 'pastoral_agent']),
  getInternalAvailableSlots
);
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
  '/appointment-services',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  saveAppointmentService
);
appointmentsRoutes.put(
  '/appointment-services/:id',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  saveAppointmentService
);
appointmentsRoutes.delete(
  '/appointment-services/:id',
  verifyToken,
  verifyUserRole(['admin', 'secretary']),
  deleteAppointmentService
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
