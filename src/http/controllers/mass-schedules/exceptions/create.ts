import { getAppContext } from '@/http/utils/getAppContext';
import { useMassScheduleExceptionSchema } from '@/schemas/use-mass-schedule-exception-schema';
import { AlreadyExistsError } from '@/use-cases/errors/already-exists-error';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeCreateMassScheduleException } from '@/use-cases/factories/mass-schedule-exceptions/make-create-mass-schedule-exception';

export const createMassScheduleException: ControllerFn = async (c) => {
  const { user, t, params, inputs } = getAppContext(c);

  const validationSchema = useMassScheduleExceptionSchema(t);

  const { exceptionDate, reason, startTime } = validationSchema.parse(inputs);

  const { id: massScheduleId } = params;

  try {
    const useCase = makeCreateMassScheduleException(c);

    const { massScheduleException } = await useCase.execute({
      scheduleId: massScheduleId,
      exceptionDate,
      reason,
      startTime,
      userId: user.id,
    });

    return c.json({ massScheduleException }, 201);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-schedule-not-found') }, 400);
    }

    if (err instanceof AlreadyExistsError) {
      return c.json({ message: t('error-exception-already-exists') }, 400);
    }

    throw err;
  }
};
