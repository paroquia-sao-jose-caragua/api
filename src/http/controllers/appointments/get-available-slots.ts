import { getAppContext } from '@/http/utils/getAppContext';
import { makeGetAvailableSlotsUseCase } from '@/use-cases/factories/appointments/make-get-available-slots-use-case';
import { PastoralAgentNotFoundError } from '@/use-cases/errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

import { AppointmentsDisabledError } from '@/use-cases/errors/appointments-disabled-error';

export const getAvailableSlots: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const agentId = c.req.query('agentId');
  const date = c.req.query('date');
  const serviceId = c.req.query('serviceId');

  if (!agentId || !date) {
    return c.json({ error: t('required-field') }, 400);
  }

  try {
    const useCase = makeGetAvailableSlotsUseCase(c);
    const result = await useCase.execute({ agentId, date, serviceId });

    return c.json(result);
  } catch (err) {
    if (err instanceof AppointmentsDisabledError) {
      return c.json({ error: t('error-appointments-disabled') }, 403);
    }
    if (err instanceof PastoralAgentNotFoundError) {
      return c.json({ error: t('error-pastoral-agent-not-found') }, 404);
    }
    if (err instanceof ServiceNotFoundError) {
      return c.json({ error: t('error-service-not-found') }, 404);
    }
    throw err;
  }
};
