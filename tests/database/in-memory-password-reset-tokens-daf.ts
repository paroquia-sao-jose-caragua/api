import type {
  PasswordResetToken,
  PasswordResetTokenType,
} from '@/entities/password-reset-token';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';

export class InMemoryPasswordResetTokensDAF implements PasswordResetTokensDAF {
  public tokens: PasswordResetToken[] = [];

  async create(data: {
    id: string;
    userId: string;
    tokenHash: string;
    type: PasswordResetTokenType;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const token: PasswordResetToken = {
      id: data.id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      type: data.type,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };

    this.tokens.push(token);
    return token;
  }

  async findValidToken(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    const now = new Date();
    const token = this.tokens.find(
      (t) =>
        t.tokenHash === tokenHash &&
        t.usedAt === null &&
        t.expiresAt.getTime() > now.getTime(),
    );

    return token || null;
  }

  async markAsUsed(id: string): Promise<void> {
    const token = this.tokens.find((t) => t.id === id);
    if (token) {
      token.usedAt = new Date();
    }
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    const now = new Date();
    for (const token of this.tokens) {
      if (token.userId === userId && token.usedAt === null) {
        token.usedAt = now;
      }
    }
  }
}
