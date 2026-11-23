import { getAppContext } from '@/http/utils/getAppContext';
import { useNoticeSchema } from '@/schemas/use-notice-schema';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';
import { makeCreateNoticeUseCase } from '@/use-cases/factories/notices/make-create-notice-use-case';
import { makeSendPushNotificationUseCase } from '@/use-cases/factories/push-subscriptions/make-send-push-notification-use-case';

export const createNotice: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useNoticeSchema(t);
  const parsed = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateNoticeUseCase(c);
    const { notice } = await createUseCase.execute(parsed);

    if (notice.active) {
      try {
        const sendPushUseCase = makeSendPushNotificationUseCase(c);
        const pushPromise = sendPushUseCase.execute({
          payload: {
            title: notice.title,
            body: notice.summary || notice.description,
            url: `/mural-de-avisos/${notice.id}`,
          },
        });
        if (c.executionCtx?.waitUntil) {
          c.executionCtx.waitUntil(pushPromise);
        } else {
          await pushPromise;
        }
      } catch (pushErr) {
        console.error('Failed to trigger push notification for notice:', pushErr);
      }
    }

    return c.json({ notice }, 201);
  } catch (err) {
    if (err instanceof AttachmentNotFoundError) {
      return c.json({ message: t('error-cover-not-uploaded-yet') }, 400);
    }
    throw err;
  }
};
