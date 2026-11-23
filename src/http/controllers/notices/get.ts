import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeGetNoticeUseCase } from '@/use-cases/factories/notices/make-get-notice-use-case';

export const getNotice: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const getUseCase = makeGetNoticeUseCase(c);
    const { notice } = await getUseCase.execute(id);

    return c.json({ notice });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('resource-not-found') }, 404);
    }
    throw err;
  }
};
