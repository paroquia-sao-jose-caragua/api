import { D1PushSubscriptionsDAF } from "@/services/database/d1/d1-push-subscriptions-daf";
import { SendPushNotificationUseCase } from "@/use-cases/push-subscriptions/send-push-notification";

export function makeSendPushNotificationUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  return new SendPushNotificationUseCase(pushSubscriptionsDaf);
}
