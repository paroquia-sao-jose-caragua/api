import { DatabaseError } from '@/errors/DatabaseError';
import type { User, UserRole, UserStatus } from '@/entities/user';
import type {
  ListUsersParams,
  ListUsersResult,
  UsersDAF,
} from '../users-daf';

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  last_login_at: string | null;
  token_version: number;
  created_at?: string;
  updated_at?: string | null;
};

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    status: (row.status || 'active') as UserStatus,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
    tokenVersion: row.token_version ?? 1,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

export class D1UsersDAF implements UsersDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.d1
      .prepare(
        'SELECT id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at FROM users WHERE id = ?',
      )
      .bind(id)
      .first<UserRow>();

    if (!user) {
      return null;
    }

    return mapRowToUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.d1
      .prepare(
        'SELECT id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at FROM users WHERE email = ?',
      )
      .bind(email)
      .first<UserRow>();

    if (!user) {
      return null;
    }

    return mapRowToUser(user);
  }

  async list(params: ListUsersParams): Promise<ListUsersResult> {
    const { page, pageSize, search, role, status } = params;
    const offset = Math.max(0, (page - 1) * pageSize);

    const conditions: string[] = [];
    const bindings: (string | number)[] = [];

    if (search && search.trim().length > 0) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      const term = `%${search.trim()}%`;
      bindings.push(term, term);
    }

    if (role) {
      conditions.push('role = ?');
      bindings.push(role);
    }

    if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await this.d1
      .prepare(countQuery)
      .bind(...bindings)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    const query = `
      SELECT id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at 
      FROM users 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const { results } = await this.d1
      .prepare(query)
      .bind(...bindings, pageSize, offset)
      .all<UserRow>();

    return {
      users: (results || []).map(mapRowToUser),
      total,
    };
  }

  async countActiveAdmins(): Promise<number> {
    const result = await this.d1
      .prepare(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'",
      )
      .first<{ count: number }>();

    return result?.count ?? 0;
  }

  async create({
    id,
    name,
    email,
    passwordHash,
    role,
    status = 'active',
    tokenVersion = 1,
  }: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
    tokenVersion?: number;
  }): Promise<User> {
    const user = await this.d1
      .prepare(
        `
        INSERT INTO users (id, name, email, password_hash, role, status, token_version, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) 
        RETURNING id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at
      `,
      )
      .bind(id, name, email, passwordHash, role, status, tokenVersion)
      .first<UserRow>();

    if (!user) {
      throw new DatabaseError('Failed to create user', {
        values: { email, role, status },
      });
    }

    return mapRowToUser(user);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.d1
      .prepare(
        `
        UPDATE users 
        SET role = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? 
        RETURNING id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at
      `,
      )
      .bind(role, id)
      .first<UserRow>();

    if (!user) {
      throw new DatabaseError('Failed to update user role', {
        values: { id, role },
      });
    }

    return mapRowToUser(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.d1
      .prepare(
        `
        UPDATE users 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? 
        RETURNING id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at
      `,
      )
      .bind(status, id)
      .first<UserRow>();

    if (!user) {
      throw new DatabaseError('Failed to update user status', {
        values: { id, status },
      });
    }

    return mapRowToUser(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.d1
      .prepare(
        `
        UPDATE users 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? 
        RETURNING id, name, email, password_hash, role, status, last_login_at, token_version, created_at, updated_at
      `,
      )
      .bind(passwordHash, id)
      .first<UserRow>();

    if (!user) {
      throw new DatabaseError('Failed to update user password', {
        values: { id },
      });
    }

    return mapRowToUser(user);
  }

  async incrementTokenVersion(id: string): Promise<number> {
    const result = await this.d1
      .prepare(
        `
        UPDATE users 
        SET token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? 
        RETURNING token_version
      `,
      )
      .bind(id)
      .first<{ token_version: number }>();

    if (!result) {
      throw new DatabaseError('Failed to increment user token version', {
        values: { id },
      });
    }

    return result.token_version;
  }

  async updateLastLogin(id: string, lastLoginAt: Date): Promise<void> {
    await this.d1
      .prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
      .bind(lastLoginAt.toISOString(), id)
      .run();
  }
}
