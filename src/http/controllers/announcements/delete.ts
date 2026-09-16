import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeDeleteAnnouncementUseCase } from '@/use-cases/factories/announcements/make-delete-announcement-use-case';

export const deleteAnnouncement: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const deleteUseCase = makeDeleteAnnouncementUseCase(c);
    await deleteUseCase.execute(id);

    return c.json({ message: 'Deleted' }, 200);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('not-found') }, 404);
    }
    throw err;
  }
};
