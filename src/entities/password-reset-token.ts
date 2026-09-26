export type PasswordResetTokenType = 'reset_password' | 'invite';

export type PasswordResetToken = {
  id: string;
  userId: string;
  tokenHash: string;
  type: PasswordResetTokenType;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt?: Date;
};
