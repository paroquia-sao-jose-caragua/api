import { getAppContext } from '@/http/utils/getAppContext';
import { useNoticeSchema } from '@/schemas/use-notice-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeEditNoticeUseCase } from '@/use-cases/factories/notices/make-edit-notice-use-case';

export const editNotice: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');

  const validationSchema = useNoticeSchema(t);
  const parsed = validationSchema.parse(inputs);

  try {
    const editUseCase = makeEditNoticeUseCase(c);
    const { notice } = await editUseCase.execute({
      id,
      ...parsed,
    });

    return c.json({ notice });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('resource-not-found') }, 404);
    }
    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }
    throw err;
  }
};
