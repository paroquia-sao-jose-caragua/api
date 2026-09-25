import { DatabaseError } from '@/errors/DatabaseError';
import type {
  PasswordResetToken,
  PasswordResetTokenType,
} from '@/entities/password-reset-token';
import type { PasswordResetTokensDAF } from '../password-reset-tokens-daf';

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  type: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

function mapRowToToken(row: PasswordResetTokenRow): PasswordResetToken {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    type: row.type as PasswordResetTokenType,
    expiresAt: new Date(row.expires_at),
    usedAt: row.used_at ? new Date(row.used_at) : null,
    createdAt: new Date(row.created_at),
  };
}

export class D1PasswordResetTokensDAF implements PasswordResetTokensDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async create({
    id,
    userId,
    tokenHash,
    type,
    expiresAt,
  }: {
    id: string;
    userId: string;
    tokenHash: string;
    type: PasswordResetTokenType;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const row = await this.d1
      .prepare(
        `
        INSERT INTO password_reset_tokens (id, user_id, token_hash, type, expires_at, created_at) 
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) 
        RETURNING id, user_id, token_hash, type, expires_at, used_at, created_at
      `,
      )
      .bind(id, userId, tokenHash, type, expiresAt.toISOString())
      .first<PasswordResetTokenRow>();

    if (!row) {
      throw new DatabaseError('Failed to create password reset token', {
        values: { userId, type },
      });
    }

    return mapRowToToken(row);
  }

  async findValidToken(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    const row = await this.d1
      .prepare(
        `
        SELECT id, user_id, token_hash, type, expires_at, used_at, created_at 
        FROM password_reset_tokens 
        WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
      `,
      )
      .bind(tokenHash)
      .first<PasswordResetTokenRow>();

    if (!row) {
      return null;
    }

    return mapRowToToken(row);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.d1
      .prepare(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?',
      )
      .bind(id)
      .run();
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.d1
      .prepare(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL',
      )
      .bind(userId)
      .run();
  }
}
