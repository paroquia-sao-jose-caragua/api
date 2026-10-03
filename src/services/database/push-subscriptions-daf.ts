import type { PushSubscriptionEntity } from '@/entities/push-subscription';

export interface PushSubscriptionsDAF {
  findById(id: string): Promise<PushSubscriptionEntity | null>;
  findByEndpoint(endpoint: string): Promise<PushSubscriptionEntity | null>;
  findAll(): Promise<PushSubscriptionEntity[]>;
  findByOrigin(origin: 'site' | 'panel'): Promise<PushSubscriptionEntity[]>;
  findByUserIds(userIds: string[]): Promise<PushSubscriptionEntity[]>;
  findByRoles(roles: string[]): Promise<PushSubscriptionEntity[]>;
  save(subscription: PushSubscriptionEntity): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
}
