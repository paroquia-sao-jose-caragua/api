import { getAppContext } from '@/http/utils/getAppContext';
import { useUrgentAlertSchema } from '@/schemas/use-urgent-alert-schema';
import { makeEditUrgentAlertUseCase } from '@/use-cases/factories/urgent-alert/make-edit-urgent-alert-use-case';

export const editUrgentAlert: ControllerFn = async (c) => {
  const { inputs } = getAppContext(c);
  const parsedBody = useUrgentAlertSchema.parse(inputs);

  const editUseCase = makeEditUrgentAlertUseCase(c);
  const { alert } = await editUseCase.execute(parsedBody);

  return c.json({ alert });
};
