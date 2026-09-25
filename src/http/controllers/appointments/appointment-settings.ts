import { getAppContext } from '@/http/utils/getAppContext';
import {
  makeGetAppointmentSettingsUseCase,
  makeUpdateAppointmentSettingsUseCase,
} from '@/use-cases/factories/appointments/make-appointment-settings-use-case';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  suspendedTitle: z.string().optional(),
  suspendedMessage: z.string().optional(),
});

export const getAppointmentSettings: ControllerFn = async (c) => {
  const useCase = makeGetAppointmentSettingsUseCase(c);
  const { settings } = await useCase.execute();

  return c.json({ settings });
};

export const updateAppointmentSettings: ControllerFn = async (c) => {
  const { inputs } = getAppContext(c);
  const data = updateSettingsSchema.parse(inputs);

  const useCase = makeUpdateAppointmentSettingsUseCase(c);
  const { settings } = await useCase.execute(data);

  return c.json({ settings });
};
