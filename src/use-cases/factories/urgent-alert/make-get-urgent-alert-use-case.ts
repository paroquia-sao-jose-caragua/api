import type { Context } from 'hono';
import { D1UrgentAlertDAF } from '@/services/database/d1/d1-urgent-alert-daf';
import { GetUrgentAlertUseCase } from '@/use-cases/urgent-alert/get-urgent-alert';

export const makeGetUrgentAlertUseCase = (c: Context) => {
  const urgentAlertDAF = new D1UrgentAlertDAF(c.env.DB);
  return new GetUrgentAlertUseCase(urgentAlertDAF);
};
