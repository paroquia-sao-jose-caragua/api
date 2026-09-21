import { getAppContext } from '@/http/utils/getAppContext';
import { useEditParishContactSchema } from '@/schemas/use-edit-parish-contact-schema';
import { makeEditParishContactUseCase } from '@/use-cases/factories/parish-contact/make-edit-parish-contact-use-case';

export const editParishContact: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useEditParishContactSchema(t);
  const parsedData = validationSchema.parse(inputs);

  const editUseCase = makeEditParishContactUseCase(c);

  const { contact } = await editUseCase.execute(parsedData);

  return c.json({
    contact,
  });
};
