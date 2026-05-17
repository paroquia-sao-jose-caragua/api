import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeGetEventScheduleUseCase } from '@/use-cases/factories/event-schedules/make-get-event-schedule-use-case';

export const getEventSchedule: ControllerFn = async (c) => {
  const { t, params } = getAppContext(c);

  const { id: eventScheduleId } = params;

  try {
    const useCase = makeGetEventScheduleUseCase(c);

    const { eventSchedule } = await useCase.execute({
      eventScheduleId,
    });

    return c.json({ eventSchedule }, 201);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-event-schedule-not-found') }, 404);
    }

    throw error;
  }
};
