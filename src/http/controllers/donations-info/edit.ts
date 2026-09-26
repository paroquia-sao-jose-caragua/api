import { getAppContext } from '@/http/utils/getAppContext';
import { useEditDonationsInfoSchema } from '@/schemas/use-edit-donations-info-schema';
import { makeEditDonationsInfoUseCase } from '@/use-cases/factories/donations-info/make-edit-donations-info-use-case';

export const editDonationsInfo: ControllerFn = async (c) => {
  const { inputs } = getAppContext(c);

  const parsedBody = useEditDonationsInfoSchema.parse(inputs ?? {});

  const editUseCase = makeEditDonationsInfoUseCase(c);

  const { donations } = await editUseCase.execute(parsedBody);

  return c.json({ donations });
};
