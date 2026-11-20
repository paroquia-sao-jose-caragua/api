import type { PushSubscriptionEntity } from '@/entities/push-subscription';
import type { PushSubscriptionsDAF } from '../push-subscriptions-daf';

type PushSubscriptionRow = {
  id: string;
  user_name: string | null;
  user_id: string | null;
  user_email?: string | null;
  user_role?: string | null;
  origin: 'site' | 'panel';
  device_id?: string | null;
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
      userEmail: row.user_email ?? null,
      userRole: row.user_role ?? null,
      origin: row.origin,
      deviceId: row.device_id ?? null,
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
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE ps.id = ?`,
      )
      .bind(id)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findByEndpoint(
    endpoint: string,
  ): Promise<PushSubscriptionEntity | null> {
    const row = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE ps.endpoint = ?`,
      )
      .bind(endpoint)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findByDeviceId(
    deviceId: string,
    origin: 'site' | 'panel',
  ): Promise<PushSubscriptionEntity | null> {
    const row = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE ps.device_id = ? AND ps.origin = ?
         ORDER BY ps.updated_at DESC
         LIMIT 1`,
      )
      .bind(deviceId, origin)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findByUserAndDevice(
    userId: string,
    deviceInfo: string,
    origin: 'site' | 'panel',
    deviceId?: string | null,
  ): Promise<PushSubscriptionEntity | null> {
    let query = `
      SELECT 
        ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
        u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
        ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
      FROM push_subscriptions ps
      LEFT JOIN users u ON ps.user_id = u.id
      WHERE ps.user_id = ? AND ps.device_info = ? AND ps.origin = ?
    `;

    const binds: unknown[] = [userId, deviceInfo, origin];

    if (deviceId) {
      query += ' AND (ps.device_id IS NULL OR ps.device_id = ?)';
      binds.push(deviceId);
    }

    query += ' ORDER BY ps.updated_at DESC LIMIT 1';

    const row = await this.d1
      .prepare(query)
      .bind(...binds)
      .first<PushSubscriptionRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<PushSubscriptionEntity[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         ORDER BY ps.created_at DESC`,
      )
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findByOrigin(
    origin: 'site' | 'panel',
  ): Promise<PushSubscriptionEntity[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE ps.origin = ?
         ORDER BY ps.created_at DESC`,
      )
      .bind(origin)
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findByUserIds(userIds: string[]): Promise<PushSubscriptionEntity[]> {
    if (userIds.length === 0) return [];

    const placeholders = userIds.map(() => '?').join(', ');
    const { results } = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE ps.user_id IN (${placeholders})
         ORDER BY ps.created_at DESC`,
      )
      .bind(...userIds)
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async findByRoles(roles: string[]): Promise<PushSubscriptionEntity[]> {
    if (roles.length === 0) return [];

    const placeholders = roles.map(() => '?').join(', ');
    const { results } = await this.d1
      .prepare(
        `SELECT 
           ps.id, COALESCE(u.name, ps.user_name) as user_name, ps.user_id, 
           u.email as user_email, u.role as user_role, ps.origin, ps.device_id, ps.device_info, 
           ps.endpoint, ps.p256dh, ps.auth, ps.created_at, ps.updated_at
         FROM push_subscriptions ps
         LEFT JOIN users u ON ps.user_id = u.id
         WHERE u.role IN (${placeholders})
         ORDER BY ps.created_at DESC`,
      )
      .bind(...roles)
      .all<PushSubscriptionRow>();

    return results.map((row) => this.mapRowToEntity(row));
  }

  async save(subscription: PushSubscriptionEntity): Promise<void> {
    // 1. Remove any other subscription using this endpoint with a different ID
    await this.d1
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND id != ?')
      .bind(subscription.endpoint, subscription.id)
      .run();

    // 2. Insert or update the subscription row
    await this.d1
      .prepare(
        `INSERT INTO push_subscriptions
         (id, user_name, user_id, origin, device_id, device_info, endpoint, p256dh, auth, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           user_name = excluded.user_name,
           user_id = excluded.user_id,
           origin = excluded.origin,
           device_id = excluded.device_id,
           device_info = excluded.device_info,
           endpoint = excluded.endpoint,
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           updated_at = excluded.updated_at`,
      )
      .bind(
        subscription.id,
        subscription.userName ?? null,
        subscription.userId ?? null,
        subscription.origin,
        subscription.deviceId ?? null,
        subscription.deviceInfo ?? null,
        subscription.endpoint,
        subscription.p256dh,
        subscription.auth,
        subscription.createdAt,
        subscription.updatedAt,
      )
      .run();
  }

  async cleanupDeviceDuplicates(params: {
    keepId: string;
    origin: 'site' | 'panel';
    userId?: string | null;
    deviceId?: string | null;
    deviceInfo?: string | null;
    endpoint: string;
  }): Promise<void> {
    // 1. Remove any stale rows holding the same endpoint with a different ID
    await this.d1
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND id != ?')
      .bind(params.endpoint, params.keepId)
      .run();

    // 2. If deviceId is provided, remove other rows for the same deviceId and origin
    if (params.deviceId) {
      await this.d1
        .prepare(
          'DELETE FROM push_subscriptions WHERE device_id = ? AND origin = ? AND id != ?',
        )
        .bind(params.deviceId, params.origin, params.keepId)
        .run();
    }

    // 3. If userId and deviceInfo are provided, remove duplicate rows for the same user, device and origin
    if (params.userId && params.deviceInfo) {
      if (params.deviceId) {
        await this.d1
          .prepare(
            `DELETE FROM push_subscriptions 
             WHERE user_id = ? AND device_info = ? AND origin = ? AND id != ? 
               AND (device_id IS NULL OR device_id = ?)`,
          )
          .bind(
            params.userId,
            params.deviceInfo,
            params.origin,
            params.keepId,
            params.deviceId,
          )
          .run();
      } else {
        await this.d1
          .prepare(
            'DELETE FROM push_subscriptions WHERE user_id = ? AND device_info = ? AND origin = ? AND id != ?',
          )
          .bind(params.userId, params.deviceInfo, params.origin, params.keepId)
          .run();
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM push_subscriptions WHERE id = ?')
      .bind(id)
      .run();
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
      .bind(endpoint)
      .run();
  }
}
