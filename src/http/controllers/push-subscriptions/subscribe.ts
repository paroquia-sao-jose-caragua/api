import { getAppContext } from "@/http/utils/getAppContext";
import { useSubscribePushSchema } from "@/schemas/use-push-subscription-schema";
import { makeSubscribePushNotificationUseCase } from "@/use-cases/factories/push-subscriptions/make-subscribe-push-notification-use-case";

export const subscribePushNotification: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useSubscribePushSchema(t);
  const parsed = validationSchema.parse(inputs);

  const userAgentHeader = c.req.header("user-agent") || null;
  const resolvedDeviceInfo = parsed.deviceInfo || userAgentHeader;

  const subscribeUseCase = makeSubscribePushNotificationUseCase(c);

  const { subscription } = await subscribeUseCase.execute({
    userName: parsed.userName,
    userId: parsed.userId,
    origin: parsed.origin,
    deviceId: parsed.deviceId,
    deviceInfo: resolvedDeviceInfo,
    endpoint: parsed.endpoint,
    p256dh: parsed.keys.p256dh,
    auth: parsed.keys.auth,
  });

  return c.json({ subscription }, 201);
};
