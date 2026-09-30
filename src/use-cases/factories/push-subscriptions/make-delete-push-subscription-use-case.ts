import { D1PushSubscriptionsDAF } from "@/services/database/d1/d1-push-subscriptions-daf";
import { DeletePushSubscriptionUseCase } from "@/use-cases/push-subscriptions/delete-push-subscription";

export function makeDeletePushSubscriptionUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  return new DeletePushSubscriptionUseCase(pushSubscriptionsDaf);
}
