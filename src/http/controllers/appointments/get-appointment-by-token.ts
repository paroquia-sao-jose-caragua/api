import { getAppContext } from '@/http/utils/getAppContext';
import { makeGetAppointmentByTokenUseCase } from '@/use-cases/factories/appointments/make-get-appointment-by-token-use-case';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';

export const getAppointmentByToken: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const token = c.req.param('token');

  try {
    const useCase = makeGetAppointmentByTokenUseCase(c);
    const { appointment } = await useCase.execute({ token });

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
    if (err instanceof AppointmentNotFoundError) {
      return c.json({ error: t('error-appointment-not-found') }, 404);
    }
    throw err;
  }
};
