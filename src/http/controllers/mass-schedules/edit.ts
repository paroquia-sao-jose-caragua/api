import { getAppContext } from '@/http/utils/getAppContext';
import { makeEditMassSchedule } from '@/use-cases/factories/mass-schedules/make-edit-mass-schedule';
import { useMassScheduleSchema } from '@/schemas/use-mass-schedule-schema';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

export const editMassSchedule: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);

  const {
    title,
    orientations,
    recurrenceType,
    type,
    isPrecept,
    startTime,
    dayOfMonth,
    dayOfWeek,
    endDate,
    startDate,
    weekOfMonth,
    active,
  } = useMassScheduleSchema(t).parse(inputs);

  const { id: massScheduleId } = params;

  try {
    const editUseCase = makeEditMassSchedule(c);

    const { massSchedule } = await editUseCase.execute({
      massScheduleId,
      title,
      orientations,
      recurrenceType,
      type,
      isPrecept,
      startTime,
      dayOfMonth,
      dayOfWeek,
      endDate,
      startDate,
      weekOfMonth,
      active: active ?? true,
    });

    return c.json({ massSchedule });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-schedule-not-found') }, 400);
    }

    throw err;
  }
};
