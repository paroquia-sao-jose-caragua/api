import type { User, UserRole, UserStatus } from '@/entities/user';
import type {
  ListUsersParams,
  ListUsersResult,
  UsersDAF,
} from '@/services/database/users-daf';

export class InMemoryUserDAF implements UsersDAF {
  public users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async list(params: ListUsersParams): Promise<ListUsersResult> {
    let filtered = [...this.users];

    if (params.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }

    if (params.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    if (params.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    const total = filtered.length;
    const offset = Math.max(0, (params.page - 1) * params.pageSize);
    const paginated = filtered.slice(offset, offset + params.pageSize);

    return {
      users: paginated,
      total,
    };
  }

  async countActiveAdmins(): Promise<number> {
    return this.users.filter((u) => u.role === 'admin' && u.status === 'active')
      .length;
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
    const newUser: User = {
      id,
      name,
      email,
      passwordHash,
      role,
      status,
      lastLoginAt: null,
      tokenVersion,
      createdAt: new Date(),
      updatedAt: null,
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.role = role;
    user.updatedAt = new Date();
    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.status = status;
    user.updatedAt = new Date();
    return user;
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.passwordHash = passwordHash;
    user.updatedAt = new Date();
    return user;
  }

  async incrementTokenVersion(id: string): Promise<number> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.tokenVersion = (user.tokenVersion ?? 1) + 1;
    user.updatedAt = new Date();
    return user.tokenVersion;
  }

  async updateLastLogin(id: string, lastLoginAt: Date): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.lastLoginAt = lastLoginAt;
    }
  }
}
