import { D1PushSubscriptionsDAF } from "@/services/database/d1/d1-push-subscriptions-daf";
import { SendPushNotificationUseCase } from "@/use-cases/push-subscriptions/send-push-notification";

export function makeSendPushNotificationUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  const siteBaseUrl = c.env.SITE_BASE_URL || "http://localhost:3000";
  const panelBaseUrl = c.env.PANEL_BASE_URL || "http://localhost:3001";

  return new SendPushNotificationUseCase(
    pushSubscriptionsDaf,
    siteBaseUrl,
    panelBaseUrl
  );
}

