import { makeGetUrgentAlertUseCase } from '@/use-cases/factories/urgent-alert/make-get-urgent-alert-use-case';

export const getUrgentAlert: ControllerFn = async (c) => {
  const getUseCase = makeGetUrgentAlertUseCase(c);
  const { alert } = await getUseCase.execute();

  return c.json({
    alert: alert || {
      id: 'primary',
      active: false,
      text: 'Aviso Paroquial: Fique atento aos novos comunicados da nossa comunidade.',
      variant: 'alert',
      startsAt: null,
      endsAt: null,
      hasModal: false,
      modalButtonText: 'Ver Detalhes',
      modalTitle: 'Comunicado Importante',
      modalDescription: 'Acompanhe as atualizações da nossa paróquia.',
      modalImageId: null,
      modalActionText: null,
      modalActionUrl: null,
    },
  });
};
