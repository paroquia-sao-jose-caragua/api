import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";
import { ulid } from "serverless-crypto-utils/id-generation";

interface SubscribePushNotificationRequest {
  userName?: string | null;
  userId?: string | null;
  origin: "site" | "panel";
  deviceInfo?: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface SubscribePushNotificationResponse {
  subscription: PushSubscriptionEntity;
}

export class SubscribePushNotificationUseCase {
  constructor(private pushSubscriptionsDaf: PushSubscriptionsDAF) {}

  async execute(
    request: SubscribePushNotificationRequest
  ): Promise<SubscribePushNotificationResponse> {
    const existing = await this.pushSubscriptionsDaf.findByEndpoint(
      request.endpoint
    );

    const now = new Date().toISOString();

    const subscription: PushSubscriptionEntity = {
      id: existing ? existing.id : ulid(),
      userName: request.userName ?? existing?.userName ?? null,
      userId: request.userId ?? existing?.userId ?? null,
      origin: request.origin,
      deviceInfo: request.deviceInfo ?? existing?.deviceInfo ?? null,
      endpoint: request.endpoint,
      p256dh: request.p256dh,
      auth: request.auth,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    await this.pushSubscriptionsDaf.save(subscription);

    return { subscription };
  }
}
