import { getAppContext } from '@/http/utils/getAppContext';
import { useAnnouncementSchema } from '@/schemas/use-announcement-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { makeCreateAnnouncementUseCase } from '@/use-cases/factories/announcements/make-create-announcement-use-case';

export const createAnnouncement: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  console.log('createAnnouncement')

  const validationSchema = useAnnouncementSchema(t);

  const parsed = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateAnnouncementUseCase(c);

    const { announcement } = await createUseCase.execute(parsed);

    return c.json({ announcement }, 201);
  } catch (err) {
    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }
    throw err;
  }
};
