import { getAppContext } from '@/http/utils/getAppContext';
import { makeDeleteAppointmentUseCase } from '@/use-cases/factories/appointments/make-delete-appointment-use-case';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error';

export const deleteAppointment: ControllerFn = async (c) => {
  const { t, user } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeDeleteAppointmentUseCase(c);
    await useCase.execute({
      id,
      userRole: user.role,
      userId: user.id,
    });

    return c.json({
      message: t('appointment-deleted-successfully'),
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
