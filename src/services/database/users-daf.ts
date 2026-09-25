import type { User, UserRole, UserStatus } from '@/entities/user';

export type ListUsersParams = {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
};

export type ListUsersResult = {
  users: User[];
  total: number;
};

export interface UsersDAF {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(params: ListUsersParams): Promise<ListUsersResult>;
  countActiveAdmins(): Promise<number>;
  create(user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
    tokenVersion?: number;
  }): Promise<User>;
  updateRole(id: string, role: UserRole): Promise<User>;
  updateStatus(id: string, status: UserStatus): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
  incrementTokenVersion(id: string): Promise<number>;
  updateLastLogin(id: string, lastLoginAt: Date): Promise<void>;
}
