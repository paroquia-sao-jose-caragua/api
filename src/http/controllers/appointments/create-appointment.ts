import { getAppContext } from '@/http/utils/getAppContext';
import { useCreateAppointmentSchema } from '@/schemas/use-appointment-schema';
import { makeCreateAppointmentUseCase } from '@/use-cases/factories/appointments/make-create-appointment-use-case';
import { AppointmentSlotUnavailableError } from '@/use-cases/errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '@/use-cases/errors/address-required-for-service-error';
import { PastoralAgentNotFoundError } from '@/use-cases/errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

import { AppointmentsDisabledError } from '@/use-cases/errors/appointments-disabled-error';

export const createAppointment: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const schema = useCreateAppointmentSchema(t);
  const data = schema.parse(inputs);

  try {
    const useCase = makeCreateAppointmentUseCase(c);
    const { appointment } = await useCase.execute(data);

    return c.json(
      {
        message: t('appointment-created-successfully'),
        appointment,
      },
      201
    );
  } catch (err) {
    if (err instanceof AppointmentsDisabledError) {
      return c.json({ error: t('error-appointments-disabled') }, 403);
    }
    if (err instanceof AppointmentSlotUnavailableError) {
      return c.json({ error: t('error-appointment-slot-unavailable') }, 409);
    }
    if (err instanceof AddressRequiredForServiceError) {
      return c.json({ error: t('error-address-required-for-service') }, 400);
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
