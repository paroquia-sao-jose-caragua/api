import type { Context } from 'hono';
import { D1UrgentAlertDAF } from '@/services/database/d1/d1-urgent-alert-daf';
import { DeleteUrgentAlertUseCase } from '@/use-cases/urgent-alert/delete-urgent-alert';

export const makeDeleteUrgentAlertUseCase = (c: Context) => {
  const urgentAlertDAF = new D1UrgentAlertDAF(c.env.DB);
  return new DeleteUrgentAlertUseCase(urgentAlertDAF);
};
