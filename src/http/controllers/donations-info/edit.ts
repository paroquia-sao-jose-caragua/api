import { useEditDonationsInfoSchema } from '@/schemas/use-edit-donations-info-schema';
import { makeEditDonationsInfoUseCase } from '@/use-cases/factories/donations-info/make-edit-donations-info-use-case';

export const editDonationsInfo: ControllerFn = async (c) => {
  const body = c.get('body');

  const parsedBody = useEditDonationsInfoSchema.parse(body);

  const editUseCase = makeEditDonationsInfoUseCase(c);

  const { donations } = await editUseCase.execute(parsedBody);

  return c.json({ donations });
};
