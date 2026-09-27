import { D1PushSubscriptionsDAF } from "@/services/database/d1/d1-push-subscriptions-daf";
import { ListPushSubscriptionsUseCase } from "@/use-cases/push-subscriptions/list-push-subscriptions";

export function makeListPushSubscriptionsUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  return new ListPushSubscriptionsUseCase(pushSubscriptionsDaf);
}
