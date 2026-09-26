import type { Context } from 'hono';
import { D1UrgentAlertDAF } from '@/services/database/d1/d1-urgent-alert-daf';
import { EditUrgentAlertUseCase } from '@/use-cases/urgent-alert/edit-urgent-alert';

export const makeEditUrgentAlertUseCase = (c: Context) => {
  const urgentAlertDAF = new D1UrgentAlertDAF(c.env.DB);
  return new EditUrgentAlertUseCase(urgentAlertDAF);
};
