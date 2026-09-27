import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";

interface SendPushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface SendPushNotificationRequest {
  payload: SendPushNotificationPayload;
  targetId?: string;
  targetOrigin?: "site" | "panel";
}

interface SendPushNotificationResponse {
  sentCount: number;
  failedCount: number;
}

export class SendPushNotificationUseCase {
  constructor(private pushSubscriptionsDaf: PushSubscriptionsDAF) {}

  async execute(
    request: SendPushNotificationRequest
  ): Promise<SendPushNotificationResponse> {
    let targets: PushSubscriptionEntity[] = [];

    if (request.targetId) {
      const sub = await this.pushSubscriptionsDaf.findById(request.targetId);
      if (sub) targets = [sub];
    } else if (request.targetOrigin) {
      targets = await this.pushSubscriptionsDaf.findByOrigin(
        request.targetOrigin
      );
    } else {
      targets = await this.pushSubscriptionsDaf.findAll();
    }

    let sentCount = 0;
    let failedCount = 0;

    const payloadString = JSON.stringify(request.payload);

    await Promise.all(
      targets.map(async (sub) => {
        try {
          // Standard WebPush payload dispatch or FCM/Browser push dispatch
          const res = await fetch(sub.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              TTL: "86400",
            },
            body: payloadString,
          });

          if (res.status === 404 || res.status === 410) {
            // Expired/unsubscribed token -> remove from D1
            await this.pushSubscriptionsDaf.delete(sub.id);
            failedCount++;
          } else if (res.ok || res.status === 201 || res.status === 202) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      })
    );

    return { sentCount, failedCount };
  }
}
