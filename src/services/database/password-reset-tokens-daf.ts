import type {
  PasswordResetToken,
  PasswordResetTokenType,
} from '@/entities/password-reset-token';

export interface PasswordResetTokensDAF {
  create(data: {
    id: string;
    userId: string;
    tokenHash: string;
    type: PasswordResetTokenType;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;
  findValidToken(tokenHash: string): Promise<PasswordResetToken | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
}
