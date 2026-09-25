import { getAppContext } from '@/http/utils/getAppContext';
import { makeListAppointmentServicesUseCase } from '@/use-cases/factories/appointments/make-list-appointment-services-use-case';

export const listAppointmentServices: ControllerFn = async (c) => {
  const listUseCase = makeListAppointmentServicesUseCase(c);
  const { services } = await listUseCase.execute({ onlyActive: true });
  return c.json({ services });
};
