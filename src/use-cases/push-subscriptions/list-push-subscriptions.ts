import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";

interface ListPushSubscriptionsRequest {
  origin?: "site" | "panel";
}

interface ListPushSubscriptionsResponse {
  subscriptions: PushSubscriptionEntity[];
}

export class ListPushSubscriptionsUseCase {
  constructor(private pushSubscriptionsDaf: PushSubscriptionsDAF) {}

  async execute(
    request: ListPushSubscriptionsRequest = {}
  ): Promise<ListPushSubscriptionsResponse> {
    const subscriptions = request.origin
      ? await this.pushSubscriptionsDaf.findByOrigin(request.origin)
      : await this.pushSubscriptionsDaf.findAll();

    return { subscriptions };
  }
}
