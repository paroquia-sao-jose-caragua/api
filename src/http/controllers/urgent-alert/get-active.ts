import { makeGetActiveUrgentAlertUseCase } from '@/use-cases/factories/urgent-alert/make-get-active-urgent-alert-use-case';

export const getActiveUrgentAlert: ControllerFn = async (c) => {
  const getActiveUseCase = makeGetActiveUrgentAlertUseCase(c);
  const { alert } = await getActiveUseCase.execute();

  return c.json({ alert });
};
