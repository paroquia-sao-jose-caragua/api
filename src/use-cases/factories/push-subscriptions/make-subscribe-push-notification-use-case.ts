import { D1PushSubscriptionsDAF } from "@/services/database/d1/d1-push-subscriptions-daf";
import { SubscribePushNotificationUseCase } from "@/use-cases/push-subscriptions/subscribe-push-notification";

export function makeSubscribePushNotificationUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  return new SubscribePushNotificationUseCase(pushSubscriptionsDaf);
}
