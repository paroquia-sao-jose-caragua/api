import { getAppContext } from '@/http/utils/getAppContext';
import { useSaveAppointmentServiceSchema } from '@/schemas/use-appointment-service-schema';
import {
  makeGetAppointmentServiceUseCase,
  makeSaveAppointmentServiceUseCase,
  makeDeleteAppointmentServiceUseCase,
} from '@/use-cases/factories/appointments/make-manage-appointment-service-use-case';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

export const getAppointmentService: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeGetAppointmentServiceUseCase(c);
    const { service } = await useCase.execute({ id });
    return c.json({ service });
  } catch (err) {
    if (err instanceof ServiceNotFoundError) {
      return c.json({ error: t('error-service-not-found') }, 404);
    }
    throw err;
  }
};

export const saveAppointmentService: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');
  const schema = useSaveAppointmentServiceSchema(t);
  const data = schema.parse(inputs);

  try {
    const useCase = makeSaveAppointmentServiceUseCase(c);
    const { service } = await useCase.execute({
      id,
      title: data.title,
      category: data.category,
      description: data.description,
      defaultDurationMinutes: data.defaultDurationMinutes,
      requiresAddress: data.requiresAddress,
      active: data.active,
    });

    return c.json({ service }, id ? 200 : 201);
  } catch (err) {
    if (err instanceof ServiceNotFoundError) {
      return c.json({ error: t('error-service-not-found') }, 404);
    }
    throw err;
  }
};

export const deleteAppointmentService: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeDeleteAppointmentServiceUseCase(c);
    await useCase.execute({ id });
    return c.json({ message: 'Service deleted successfully' });
  } catch (err) {
    if (err instanceof ServiceNotFoundError) {
      return c.json({ error: t('error-service-not-found') }, 404);
    }
    throw err;
  }
};
