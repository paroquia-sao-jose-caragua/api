import type { PushSubscriptionEntity } from '@/entities/push-subscription';

export interface PushSubscriptionsDAF {
  findById(id: string): Promise<PushSubscriptionEntity | null>;
  findByEndpoint(endpoint: string): Promise<PushSubscriptionEntity | null>;
  findByDeviceId(
    deviceId: string,
    origin: 'site' | 'panel',
  ): Promise<PushSubscriptionEntity | null>;
  findByUserAndDevice(
    userId: string,
    deviceInfo: string,
    origin: 'site' | 'panel',
    deviceId?: string | null,
  ): Promise<PushSubscriptionEntity | null>;
  findAll(): Promise<PushSubscriptionEntity[]>;
  findByOrigin(origin: 'site' | 'panel'): Promise<PushSubscriptionEntity[]>;
  findByUserIds(userIds: string[]): Promise<PushSubscriptionEntity[]>;
  findByRoles(roles: string[]): Promise<PushSubscriptionEntity[]>;
  save(subscription: PushSubscriptionEntity): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
  cleanupDeviceDuplicates(params: {
    keepId: string;
    origin: 'site' | 'panel';
    userId?: string | null;
    deviceId?: string | null;
    deviceInfo?: string | null;
    endpoint: string;
  }): Promise<void>;
}
