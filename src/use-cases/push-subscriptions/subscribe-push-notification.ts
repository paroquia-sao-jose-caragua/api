import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";
import { ulid } from "serverless-crypto-utils/id-generation";

interface SubscribePushNotificationRequest {
  userName?: string | null;
  userId?: string | null;
  origin: "site" | "panel";
  deviceId?: string | null;
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
    let existing: PushSubscriptionEntity | null = null;

    // 1. Look for existing device subscription by deviceId and origin
    if (request.deviceId) {
      existing = await this.pushSubscriptionsDaf.findByDeviceId(
        request.deviceId,
        request.origin
      );
    }

    // 2. If not found by deviceId, and user is authenticated with deviceInfo:
    // Enforce: "deve ser um aparelho por user agent e usuário, se o user agent for diferente, aí inclui."
    if (!existing && request.userId && request.deviceInfo) {
      existing = await this.pushSubscriptionsDaf.findByUserAndDevice(
        request.userId,
        request.deviceInfo,
        request.origin,
        request.deviceId
      );
    }

    // 3. Fallback: Check if this push endpoint was already registered
    if (!existing) {
      existing = await this.pushSubscriptionsDaf.findByEndpoint(
        request.endpoint
      );
    }

    const now = new Date().toISOString();

    const subscription: PushSubscriptionEntity = {
      id: existing ? existing.id : ulid(),
      userName: request.userName ?? existing?.userName ?? null,
      userId: request.userId ?? existing?.userId ?? null,
      origin: request.origin,
      deviceId: request.deviceId ?? existing?.deviceId ?? null,
      deviceInfo: request.deviceInfo ?? existing?.deviceInfo ?? null,
      endpoint: request.endpoint,
      p256dh: request.p256dh,
      auth: request.auth,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    // Save or update subscription
    await this.pushSubscriptionsDaf.save(subscription);

    // Clean up any other duplicates for this device, user agent or endpoint
    await this.pushSubscriptionsDaf.cleanupDeviceDuplicates({
      keepId: subscription.id,
      origin: subscription.origin,
      userId: subscription.userId,
      deviceId: subscription.deviceId,
      deviceInfo: subscription.deviceInfo,
      endpoint: subscription.endpoint,
    });

    return { subscription };
  }
}
