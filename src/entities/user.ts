export type UserRole =
  | 'admin'
  | 'secretary'
  | 'user'
  | 'pastoral_agent'
  | 'viewer';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  tokenVersion: number;
  createdAt?: Date;
  updatedAt?: Date | null;
};
