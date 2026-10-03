import { D1PushSubscriptionsDAF } from '@/services/database/d1/d1-push-subscriptions-daf';
import { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';

export function makeSendPushNotificationUseCase(c: DomainContext) {
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(c.env.DB);
  const siteBaseUrl = c.env.SITE_BASE_URL || 'http://localhost:3000';
  const panelBaseUrl = c.env.PANEL_BASE_URL || 'http://localhost:3001';
  const vapidSubject =
    c.env.VAPID_SUBJECT || 'mailto:contato@paroquiasaojosecaragua.org.br';
  const vapidPublicKey = c.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = c.env.VAPID_PRIVATE_KEY;

  return new SendPushNotificationUseCase(
    pushSubscriptionsDaf,
    siteBaseUrl,
    panelBaseUrl,
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey,
  );
}
