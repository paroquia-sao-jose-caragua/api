import { getAppContext } from '@/http/utils/getAppContext';
import { useCreateAppointmentSchema } from '@/schemas/use-appointment-schema';
import { makeUpdateAppointmentUseCase } from '@/use-cases/factories/appointments/make-update-appointment-use-case';
import { AppointmentSlotUnavailableError } from '@/use-cases/errors/appointment-slot-unavailable-error';
import { AddressRequiredForServiceError } from '@/use-cases/errors/address-required-for-service-error';
import { PastoralAgentNotFoundError } from '@/use-cases/errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';

export const updateAppointment: ControllerFn = async (c) => {
  const { t, inputs, user } = getAppContext(c);
  const id = c.req.param('id');
  const schema = useCreateAppointmentSchema(t);
  const data = schema.parse(inputs);

  if (user && user.role === 'pastoral_agent') {
    const daf = new D1PastoralAgentsDAF(c.env.DB);
    const agent = await daf.findByUserId(user.id);
    if (!agent) {
      return c.json({ error: t('error-pastoral-agent-not-found') }, 403);
    }
    if (data.agentId && data.agentId !== agent.id) {
      return c.json({ error: t('unauthorized') }, 403);
    }
    data.agentId = agent.id;
  }

  try {
    const useCase = makeUpdateAppointmentUseCase(c);
    const { appointment } = await useCase.execute({
      id,
      ...data,
      userRole: user?.role,
      userId: user?.id,
    });

    return c.json({
      message: t('appointment-updated-successfully'),
      appointment,
    });
  } catch (err) {
    if (err instanceof NotAllowedError) {
      return c.json({ error: t('error-not-allowed') }, 403);
    }
    if (err instanceof AppointmentNotFoundError) {
      return c.json({ error: t('error-appointment-not-found') }, 404);
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
