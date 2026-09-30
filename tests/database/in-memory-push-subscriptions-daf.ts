import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "@/services/database/push-subscriptions-daf";

export class InMemoryPushSubscriptionsDAF implements PushSubscriptionsDAF {
  public items: PushSubscriptionEntity[] = [];

  async findById(id: string): Promise<PushSubscriptionEntity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscriptionEntity | null> {
    return this.items.find((item) => item.endpoint === endpoint) ?? null;
  }

  async findAll(): Promise<PushSubscriptionEntity[]> {
    return [...this.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findByOrigin(origin: "site" | "panel"): Promise<PushSubscriptionEntity[]> {
    return this.items
      .filter((item) => item.origin === origin)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async save(subscription: PushSubscriptionEntity): Promise<void> {
    const existingIndex = this.items.findIndex(
      (item) => item.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      this.items[existingIndex] = {
        ...this.items[existingIndex],
        ...subscription,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.items.push(subscription);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    this.items = this.items.filter((item) => item.endpoint !== endpoint);
  }
}
