import type { PushSubscriptionEntity } from '@/entities/push-subscription';
import type { PushSubscriptionsDAF } from '@/services/database/push-subscriptions-daf';

interface SendPushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface SendPushNotificationRequest {
  payload: SendPushNotificationPayload;
  targetId?: string;
  targetOrigin?: 'site' | 'panel';
  targetUserIds?: string[];
  targetRoles?: string[];
}

interface SendPushNotificationResponse {
  sentCount: number;
  failedCount: number;
}

export class SendPushNotificationUseCase {
  constructor(
    private pushSubscriptionsDaf: PushSubscriptionsDAF,
    private siteBaseUrl = 'http://localhost:3000',
    private panelBaseUrl = 'http://localhost:3001',
  ) {}

  async execute(
    request: SendPushNotificationRequest,
  ): Promise<SendPushNotificationResponse> {
    let targets: PushSubscriptionEntity[] = [];

    if (request.targetId) {
      const sub = await this.pushSubscriptionsDaf.findById(request.targetId);
      if (sub) targets = [sub];
    } else if (request.targetUserIds && request.targetUserIds.length > 0) {
      targets = await this.pushSubscriptionsDaf.findByUserIds(
        request.targetUserIds,
      );
    } else if (request.targetRoles && request.targetRoles.length > 0) {
      targets = await this.pushSubscriptionsDaf.findByRoles(
        request.targetRoles,
      );
    } else if (request.targetOrigin) {
      targets = await this.pushSubscriptionsDaf.findByOrigin(
        request.targetOrigin,
      );
    } else {
      targets = await this.pushSubscriptionsDaf.findAll();
    }

    const uniqueTargets = Array.from(
      new Map(targets.map((sub) => [sub.endpoint, sub])).values(),
    );

    let sentCount = 0;
    let failedCount = 0;

    await Promise.all(
      uniqueTargets.map(async (sub) => {
        try {
          const targetBaseUrl =
            sub.origin === 'panel' ? this.panelBaseUrl : this.siteBaseUrl;

          let targetUrl = request.payload.url || '/';

          // If URL is relative, prepend origin domain (site or panel)
          if (targetUrl.startsWith('/')) {
            targetUrl = `${targetBaseUrl}${targetUrl}`;
          }

          const devicePayload = {
            title: request.payload.title,
            body: request.payload.body,
            url: targetUrl,
            icon:
              request.payload.icon || `${targetBaseUrl}/icons/icon-192x192.png`,
            badge: `${targetBaseUrl}/icons/icon-192x192.png`,
            origin: sub.origin,
          };

          const res = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              TTL: '86400',
            },
            body: JSON.stringify(devicePayload),
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
      }),
    );

    return { sentCount, failedCount };
  }
}
