import { getAppContext } from '@/http/utils/getAppContext';
import { useEventScheduleSchema } from '@/schemas/use-event-schedule-schema';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeCreateEventScheduleUseCase } from '@/use-cases/factories/event-schedules/make-create-event-schedule-use-case';

export const createEventSchedule: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const {
    communityId,
    eventDate,
    startTime,
    title,
    type,
    massType,
    isPrecept,
    customLocation,
    endTime,
    orientations,
  } = useEventScheduleSchema(t).parse(inputs);

  try {
    const useCase = makeCreateEventScheduleUseCase(c);

    const { eventSchedule } = await useCase.execute({
      communityId,
      eventDate,
      startTime,
      title,
      type,
      massType,
      isPrecept,
      customLocation,
      endTime,
      orientations,
    });

    return c.json({ eventSchedule }, 201);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-community-not-found') }, 404);
    }

    throw error;
  }
};
