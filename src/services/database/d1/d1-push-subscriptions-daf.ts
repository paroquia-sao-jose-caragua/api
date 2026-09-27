import type { PushSubscriptionEntity } from "@/entities/push-subscription";
import type { PushSubscriptionsDAF } from "../push-subscriptions-daf";

type PushSubscriptionRow = {
  id: string;
  user_name: string | null;
  user_id: string | null;
  origin: "site" | "panel";
  device_info: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
};

export class D1PushSubscriptionsDAF implements PushSubscriptionsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: PushSubscriptionRow): PushSubscriptionEntity {
    return {
      id: row.id,
      userName: row.user_name,
      userId: row.user_id,
      origin: row.origin,
      deviceInfo: row.device_info,
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<PushSubscriptionEntity | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, user_name, user_id, origin, device_info, endpoint, p256dh, auth, created_at, updated_at
         FROM push_subscriptions
         WHERE id = ?`
      )
      .bind(id)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscriptionEntity | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, user_name, user_id, origin, device_info, endpoint, p256dh, auth, created_at, updated_at
         FROM push_subscriptions
         WHERE endpoint = ?`
      )
      .bind(endpoint)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<PushSubscriptionEntity[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT id, user_name, user_id, origin, device_info, endpoint, p256dh, auth, created_at, updated_at
         FROM push_subscriptions
         ORDER BY created_at DESC`
      )
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findByOrigin(origin: "site" | "panel"): Promise<PushSubscriptionEntity[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT id, user_name, user_id, origin, device_info, endpoint, p256dh, auth, created_at, updated_at
         FROM push_subscriptions
         WHERE origin = ?
         ORDER BY created_at DESC`
      )
      .bind(origin)
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async save(subscription: PushSubscriptionEntity): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO push_subscriptions
         (id, user_name, user_id, origin, device_info, endpoint, p256dh, auth, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET
           user_name = excluded.user_name,
           user_id = excluded.user_id,
           origin = excluded.origin,
           device_info = excluded.device_info,
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           updated_at = excluded.updated_at`
      )
      .bind(
        subscription.id,
        subscription.userName ?? null,
        subscription.userId ?? null,
        subscription.origin,
        subscription.deviceInfo ?? null,
        subscription.endpoint,
        subscription.p256dh,
        subscription.auth,
        subscription.createdAt,
        subscription.updatedAt
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1
      .prepare("DELETE FROM push_subscriptions WHERE id = ?")
      .bind(id)
      .run();
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.d1
      .prepare("DELETE FROM push_subscriptions WHERE endpoint = ?")
      .bind(endpoint)
      .run();
  }
}
