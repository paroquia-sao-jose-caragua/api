import { getAppContext } from '@/http/utils/getAppContext';
import { makeGetAppointmentByIdUseCase } from '@/use-cases/factories/appointments/make-get-appointment-by-id-use-case';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error';

export const getAppointmentById: ControllerFn = async (c) => {
  const { t, user } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeGetAppointmentByIdUseCase(c);
    const { appointment } = await useCase.execute({
      id,
      userRole: user.role,
      userId: user.id,
    });

    return c.json({
      appointment: {
        ...appointment,
        agent: appointment.agent
          ? {
              ...appointment.agent,
              photoUrl: appointment.agent.photoId
                ? `${c.env.S3_API_URL}/${appointment.agent.photoId}`
                : null,
            }
          : null,
      },
    });
  } catch (err) {
    if (err instanceof NotAllowedError) {
      return c.json({ error: t('error-not-allowed') }, 403);
    }
    if (err instanceof AppointmentNotFoundError) {
      return c.json({ error: t('error-appointment-not-found') }, 404);
    }
    throw err;
  }
};
