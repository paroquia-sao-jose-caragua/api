import { makeDeleteUrgentAlertUseCase } from '@/use-cases/factories/urgent-alert/make-delete-urgent-alert-use-case';

export const deleteUrgentAlert: ControllerFn = async (c) => {
  const deleteUseCase = makeDeleteUrgentAlertUseCase(c);
  await deleteUseCase.execute();

  return c.json({ message: 'Alerta excluído/desativado com sucesso' });
};
