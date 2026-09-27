import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";

interface DeletePushSubscriptionRequest {
  id: string;
}

export class DeletePushSubscriptionUseCase {
  constructor(private pushSubscriptionsDaf: PushSubscriptionsDAF) {}

  async execute(request: DeletePushSubscriptionRequest): Promise<void> {
    const subscription = await this.pushSubscriptionsDaf.findById(request.id);
    if (!subscription) {
      return;
    }
    await this.pushSubscriptionsDaf.delete(request.id);
  }
}
