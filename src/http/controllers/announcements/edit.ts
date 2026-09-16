import { getAppContext } from '@/http/utils/getAppContext';
import { useAnnouncementSchema } from '@/schemas/use-announcement-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeEditAnnouncementUseCase } from '@/use-cases/factories/announcements/make-edit-announcement-use-case';

export const editAnnouncement: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');

  const validationSchema = useAnnouncementSchema(t);

  const parsed = validationSchema.parse(inputs);

  try {
    const editUseCase = makeEditAnnouncementUseCase(c);

    const { announcement } = await editUseCase.execute({
      id,
      ...parsed,
    });

    return c.json({ announcement });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('not-found') }, 404);
    }
    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }
    throw err;
  }
};
