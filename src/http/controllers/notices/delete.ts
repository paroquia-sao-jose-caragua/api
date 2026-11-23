import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeDeleteNoticeUseCase } from '@/use-cases/factories/notices/make-delete-notice-use-case';

export const deleteNotice: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const deleteUseCase = makeDeleteNoticeUseCase(c);
    await deleteUseCase.execute(id);

    return c.json({ message: 'Deleted' }, 200);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('resource-not-found') }, 404);
    }
    throw err;
  }
};
