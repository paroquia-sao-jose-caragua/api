import { getAppContext } from '@/http/utils/getAppContext';
import { useCancelAppointmentSchema } from '@/schemas/use-appointment-schema';
import { makeCancelAppointmentByTokenUseCase } from '@/use-cases/factories/appointments/make-cancel-appointment-by-token-use-case';
import { AppointmentNotFoundError } from '@/use-cases/errors/appointment-not-found-error';

export const cancelAppointmentByToken: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const token = c.req.param('token');
  const schema = useCancelAppointmentSchema(t);
  const { cancellationReason } = schema.parse(inputs);

  try {
    const useCase = makeCancelAppointmentByTokenUseCase(c);
    await useCase.execute({ token, cancellationReason });

    return c.json({
      message: t('appointment-cancelled-successfully'),
    });
  } catch (err) {
    if (err instanceof AppointmentNotFoundError) {
      return c.json({ error: t('error-appointment-not-found') }, 404);
    }
    throw err;
  }
};
