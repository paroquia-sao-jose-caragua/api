import { getAppContext } from '@/http/utils/getAppContext';
import { makeCreateMassSchedule } from '@/use-cases/factories/mass-schedules/make-create-mass-schedule';
import { useMassScheduleSchema } from '@/schemas/use-mass-schedule-schema';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

export const createMassSchedule: ControllerFn = async (c) => {
  const { t, inputs, params } = getAppContext(c);

  const values = useMassScheduleSchema(t).parse(inputs);

  const { id: communityId } = params;

  try {
    const createUseCase = makeCreateMassSchedule(c);

    const { massSchedule } = await createUseCase.execute({
      communityId,
      ...values,
    });

    return c.json({ massSchedule }, 201);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-community-not-found') }, 400);
    }

    throw err;
  }
};
