import type { UsersDAF } from '@/services/database/users-daf';
import type { UserRole, UserStatus } from '@/entities/user';

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date | null;
};

interface ListUsersUseCaseRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

interface ListUsersUseCaseResponse {
  users: SafeUser[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListUsersUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    page = 1,
    pageSize = 10,
    search,
    role,
    status,
  }: ListUsersUseCaseRequest = {}): Promise<ListUsersUseCaseResponse> {
    const validPage = Math.max(1, page);
    const validPageSize = Math.min(100, Math.max(1, pageSize));

    const { users, total } = await this.usersDaf.list({
      page: validPage,
      pageSize: validPageSize,
      search,
      role,
      status,
    });

    const safeUsers: SafeUser[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      users: safeUsers,
      total,
      page: validPage,
      pageSize: validPageSize,
    };
  }
}
