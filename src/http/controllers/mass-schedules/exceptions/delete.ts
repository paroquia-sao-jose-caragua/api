import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeDeleteMassScheduleException } from '@/use-cases/factories/mass-schedule-exceptions/make-delete-mass-schedule-exception';

export const deleteMassScheduleException: ControllerFn = async (c) => {
  const { t, params } = getAppContext(c);

  const { id: exceptionId } = params;

  try {
    const useCase = makeDeleteMassScheduleException(c);

    await useCase.execute({
      exceptionId,
    });

    return c.json(204);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-exception-not-found') }, 400);
    }

    throw err;
  }
};
