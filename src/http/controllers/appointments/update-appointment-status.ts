import { getAppContext } from '@/http/utils/getAppContext';
import { useUpdateAppointmentStatusSchema } from '@/schemas/use-appointment-schema';
import { makeUpdateAppointmentStatusUseCase } from '@/use-cases/factories/appointments/make-update-appointment-status-use-case';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error';

export const updateAppointmentStatus: ControllerFn = async (c) => {
  const { t, inputs, user } = getAppContext(c);
  const id = c.req.param('id');
  const schema = useUpdateAppointmentStatusSchema(t);
  const data = schema.parse(inputs);

  try {
    const useCase = makeUpdateAppointmentStatusUseCase(c);
    await useCase.execute({
      id,
      status: data.status,
      cancellationReason: data.cancellationReason,
      privateNotes: data.privateNotes,
      userRole: user.role,
      userId: user.id,
    });

    return c.json({
      message: t('appointment-status-updated-successfully'),
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
