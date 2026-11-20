import type { PushSubscriptionEntity } from '@/entities/push-subscription';
import type { PushSubscriptionsDAF } from '@/services/database/push-subscriptions-daf';

export class InMemoryPushSubscriptionsDAF implements PushSubscriptionsDAF {
  public items: PushSubscriptionEntity[] = [];

  async findById(id: string): Promise<PushSubscriptionEntity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByEndpoint(
    endpoint: string,
  ): Promise<PushSubscriptionEntity | null> {
    return this.items.find((item) => item.endpoint === endpoint) ?? null;
  }

  async findByDeviceId(
    deviceId: string,
    origin: 'site' | 'panel',
  ): Promise<PushSubscriptionEntity | null> {
    return (
      this.items
        .filter((item) => item.deviceId === deviceId && item.origin === origin)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0] ?? null
    );
  }

  async findByUserAndDevice(
    userId: string,
    deviceInfo: string,
    origin: 'site' | 'panel',
    deviceId?: string | null,
  ): Promise<PushSubscriptionEntity | null> {
    return (
      this.items
        .filter(
          (item) =>
            item.userId === userId &&
            item.deviceInfo === deviceInfo &&
            item.origin === origin &&
            (!deviceId || !item.deviceId || item.deviceId === deviceId),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0] ?? null
    );
  }

  async findAll(): Promise<PushSubscriptionEntity[]> {
    return [...this.items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async findByOrigin(
    origin: 'site' | 'panel',
  ): Promise<PushSubscriptionEntity[]> {
    return this.items
      .filter((item) => item.origin === origin)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async findByUserIds(userIds: string[]): Promise<PushSubscriptionEntity[]> {
    return this.items
      .filter((item) => item.userId && userIds.includes(item.userId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async findByRoles(roles: string[]): Promise<PushSubscriptionEntity[]> {
    return this.items
      .filter((item) => item.userRole && roles.includes(item.userRole))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async save(subscription: PushSubscriptionEntity): Promise<void> {
    // 1. Remove any other item using this endpoint with a different ID
    this.items = this.items.filter(
      (item) => item.endpoint !== subscription.endpoint || item.id === subscription.id,
    );

    // 2. Insert or update the subscription
    const existingIndex = this.items.findIndex(
      (item) => item.id === subscription.id,
    );

    if (existingIndex >= 0) {
      this.items[existingIndex] = {
        ...this.items[existingIndex],
        ...subscription,
        updatedAt: subscription.updatedAt || new Date().toISOString(),
      };
    } else {
      this.items.push(subscription);
    }
  }

  async cleanupDeviceDuplicates(params: {
    keepId: string;
    origin: 'site' | 'panel';
    userId?: string | null;
    deviceId?: string | null;
    deviceInfo?: string | null;
    endpoint: string;
  }): Promise<void> {
    this.items = this.items.filter((item) => {
      if (item.id === params.keepId) return true;

      // Duplicate endpoint
      if (item.endpoint === params.endpoint) return false;

      // Duplicate deviceId on same origin
      if (params.deviceId && item.deviceId === params.deviceId && item.origin === params.origin) {
        return false;
      }

      // Duplicate user and device info on same origin
      if (
        params.userId &&
        params.deviceInfo &&
        item.userId === params.userId &&
        item.deviceInfo === params.deviceInfo &&
        item.origin === params.origin
      ) {
        if (!params.deviceId || !item.deviceId || item.deviceId === params.deviceId) {
          return false;
        }
      }

      return true;
    });
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    this.items = this.items.filter((item) => item.endpoint !== endpoint);
  }
}
