import type { Context } from 'hono';
import { D1UrgentAlertDAF } from '@/services/database/d1/d1-urgent-alert-daf';
import { GetActiveUrgentAlertUseCase } from '@/use-cases/urgent-alert/get-active-urgent-alert';

export const makeGetActiveUrgentAlertUseCase = (c: Context) => {
  const urgentAlertDAF = new D1UrgentAlertDAF(c.env.DB);
  return new GetActiveUrgentAlertUseCase(urgentAlertDAF);
};
