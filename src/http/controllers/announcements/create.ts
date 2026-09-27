import { getAppContext } from '@/http/utils/getAppContext';
import { useAnnouncementSchema } from '@/schemas/use-announcement-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { makeCreateAnnouncementUseCase } from '@/use-cases/factories/announcements/make-create-announcement-use-case';
import { makeSendPushNotificationUseCase } from '@/use-cases/factories/push-subscriptions/make-send-push-notification-use-case';

export const createAnnouncement: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useAnnouncementSchema(t);

  const parsed = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateAnnouncementUseCase(c);

    const { announcement } = await createUseCase.execute(parsed);

    if (announcement.active) {
      try {
        const sendPushUseCase = makeSendPushNotificationUseCase(c);
        const pushPromise = sendPushUseCase.execute({
          payload: {
            title: announcement.title,
            body: announcement.description,
            url: announcement.actionUrl ?? '/',
          },
        });
        if (c.executionCtx?.waitUntil) {
          c.executionCtx.waitUntil(pushPromise);
        } else {
          await pushPromise;
        }
      } catch (pushErr) {
        console.error('Failed to trigger push notification for announcement:', pushErr);
      }
    }

    return c.json({ announcement }, 201);
  } catch (err) {
    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }
    throw err;
  }
};

