import { getAppContext } from "@/http/utils/getAppContext";
import { useSendPushNotificationSchema } from "@/schemas/use-push-subscription-schema";
import { makeSendPushNotificationUseCase } from "@/use-cases/factories/push-subscriptions/make-send-push-notification-use-case";

export const sendTestPushNotification: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useSendPushNotificationSchema(t);
  const parsed = validationSchema.parse(inputs);

  const sendUseCase = makeSendPushNotificationUseCase(c);

  const result = await sendUseCase.execute({
    payload: {
      title: parsed.title,
      body: parsed.body,
      url: parsed.url ?? "/",
    },
    targetId: parsed.targetId ?? undefined,
    targetOrigin: parsed.targetOrigin ?? undefined,
  });

  return c.json(result, 200);
};
