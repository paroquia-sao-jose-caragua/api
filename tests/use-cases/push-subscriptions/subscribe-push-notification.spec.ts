import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPushSubscriptionsDAF } from '../../database/in-memory-push-subscriptions-daf';
import { SubscribePushNotificationUseCase } from '@/use-cases/push-subscriptions/subscribe-push-notification';
import type { PushSubscriptionEntity } from '@/entities/push-subscription';

describe('SubscribePushNotificationUseCase', () => {
  let pushSubscriptionsDaf: InMemoryPushSubscriptionsDAF;
  let sut: SubscribePushNotificationUseCase;

  beforeEach(() => {
    pushSubscriptionsDaf = new InMemoryPushSubscriptionsDAF();
    sut = new SubscribePushNotificationUseCase(pushSubscriptionsDaf);
  });

  it('should register a new subscription for a new device', async () => {
    const { subscription } = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-mac-1',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-1',
      p256dh: 'p256dh-key-1',
      auth: 'auth-key-1',
    });

    expect(subscription.id).toBeDefined();
    expect(subscription.userId).toBe('user-1');
    expect(subscription.deviceId).toBe('dev-mac-1');
    expect(pushSubscriptionsDaf.items).toHaveLength(1);
  });

  it('should update the existing subscription when the same device reconnects with a new endpoint (no duplicate)', async () => {
    // Initial subscription from Mac
    const first = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-mac-1',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-1',
      p256dh: 'p256dh-key-1',
      auth: 'auth-key-1',
    });

    // Reconnection or token renewal from the same Mac with new endpoint
    const second = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-mac-1',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-2-renewed',
      p256dh: 'p256dh-key-2',
      auth: 'auth-key-2',
    });

    expect(second.subscription.id).toBe(first.subscription.id);
    expect(second.subscription.endpoint).toBe('https://fcm.googleapis.com/fcm/send/token-2-renewed');
    expect(pushSubscriptionsDaf.items).toHaveLength(1);
    expect(pushSubscriptionsDaf.items[0].endpoint).toBe('https://fcm.googleapis.com/fcm/send/token-2-renewed');
  });

  it('should allow multiple distinct devices (different user agents / devices) for the same user', async () => {
    // 1. User connects from Mac (Chrome no macOS)
    const macSub = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-mac-1',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-mac',
      p256dh: 'p256dh-key-mac',
      auth: 'auth-key-mac',
    });

    // 2. User connects from iPhone (Safari no iOS)
    const iphoneSub = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-iphone-1',
      deviceInfo: 'Safari no iOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-iphone',
      p256dh: 'p256dh-key-iphone',
      auth: 'auth-key-iphone',
    });

    expect(iphoneSub.subscription.id).not.toBe(macSub.subscription.id);
    expect(pushSubscriptionsDaf.items).toHaveLength(2);

    const userSubs = await pushSubscriptionsDaf.findByUserIds(['user-1']);
    expect(userSubs).toHaveLength(2);
    expect(userSubs.map((s: PushSubscriptionEntity) => s.deviceInfo)).toContain('Chrome no macOS');
    expect(userSubs.map((s: PushSubscriptionEntity) => s.deviceInfo)).toContain('Safari no iOS');
  });

  it('should update the subscription for the same user and same user agent when deviceId is not provided', async () => {
    // 1. Initial subscription without deviceId
    const first = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-1',
      p256dh: 'p256dh-key-1',
      auth: 'auth-key-1',
    });

    // 2. Second subscription for same user with same deviceInfo / user agent
    const second = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/token-2-updated',
      p256dh: 'p256dh-key-2',
      auth: 'auth-key-2',
    });

    expect(second.subscription.id).toBe(first.subscription.id);
    expect(pushSubscriptionsDaf.items).toHaveLength(1);
    expect(pushSubscriptionsDaf.items[0].endpoint).toBe('https://fcm.googleapis.com/fcm/send/token-2-updated');
  });

  it('should clean up pre-existing duplicates for the same user and device', async () => {
    // Manually simulate 2 duplicate rows already in database for same user and device
    pushSubscriptionsDaf.items.push(
      {
        id: 'dup-1',
        userName: 'User 1',
        userId: 'user-1',
        origin: 'panel',
        deviceId: 'dev-mac-1',
        deviceInfo: 'Chrome no macOS',
        endpoint: 'https://fcm.googleapis.com/fcm/send/old-1',
        p256dh: 'k1',
        auth: 'a1',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'dup-2',
        userName: 'User 1',
        userId: 'user-1',
        origin: 'panel',
        deviceId: 'dev-mac-1',
        deviceInfo: 'Chrome no macOS',
        endpoint: 'https://fcm.googleapis.com/fcm/send/old-2',
        p256dh: 'k2',
        auth: 'a2',
        createdAt: '2026-09-02T00:00:00.000Z',
        updatedAt: '2026-09-02T00:00:00.000Z',
      },
    );

    expect(pushSubscriptionsDaf.items).toHaveLength(2);

    // Client checks in
    const result = await sut.execute({
      userId: 'user-1',
      userName: 'User 1',
      origin: 'panel',
      deviceId: 'dev-mac-1',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/active-endpoint',
      p256dh: 'k3',
      auth: 'a3',
    });

    expect(pushSubscriptionsDaf.items).toHaveLength(1);
    expect(pushSubscriptionsDaf.items[0].id).toBe(result.subscription.id);
    expect(pushSubscriptionsDaf.items[0].endpoint).toBe('https://fcm.googleapis.com/fcm/send/active-endpoint');
  });

  it('should update anonymous device subscription on the site without duplicating', async () => {
    // Visitor on site registers
    const site1 = await sut.execute({
      userName: 'Fiel (Chrome no macOS)',
      origin: 'site',
      deviceId: 'visitor-mac-uuid',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/site-endpoint-1',
      p256dh: 'k1',
      auth: 'a1',
    });

    // Visitor updates token
    const site2 = await sut.execute({
      userName: 'Maria (Chrome no macOS)',
      origin: 'site',
      deviceId: 'visitor-mac-uuid',
      deviceInfo: 'Chrome no macOS',
      endpoint: 'https://fcm.googleapis.com/fcm/send/site-endpoint-2',
      p256dh: 'k2',
      auth: 'a2',
    });

    expect(site2.subscription.id).toBe(site1.subscription.id);
    expect(pushSubscriptionsDaf.items).toHaveLength(1);
    expect(pushSubscriptionsDaf.items[0].userName).toBe('Maria (Chrome no macOS)');
    expect(pushSubscriptionsDaf.items[0].endpoint).toBe('https://fcm.googleapis.com/fcm/send/site-endpoint-2');
  });
});
