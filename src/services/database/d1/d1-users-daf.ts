import { ulid } from 'serverless-crypto-utils/id-generation';
import { DatabaseError } from '@/errors/DatabaseError';
import type { UsersDAF } from '../users-daf';

export class D1UserDAF implements UsersDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findByEmail(email: string) {
    const user = await this.d1
      .prepare(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      )
      .bind(email)
      .first<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: 'admin' | 'user' | 'viewer';
      }>();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
      role: user.role,
    };
  }

  async create({
    id,
    name,
    email,
    passwordHash,
    role,
  }: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'user' | 'viewer';
  }) {
    const user = await this.d1
      .prepare(
        `
        INSERT INTO users (id, name, email, password_hash, role) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING id, name, email, password_hash, role
      `,
      )
      .bind(id, name, email, passwordHash, role)
      .first<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: 'admin' | 'user' | 'viewer';
      }>();

    if (!user) {
      throw new DatabaseError('Failed to create user', {
        values: { email, passwordHash, role },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
      role: user.role,
    };
  }
}
