import type { UsersDAF } from '@/services/database/users-daf';
import type { UserStatus } from '@/entities/user';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { LastAdminError } from '../errors/last-admin-error';
import type { SafeUser } from './list-users';

interface UpdateUserStatusUseCaseRequest {
  targetUserId: string;
  newStatus: UserStatus;
  currentAdminId: string;
}

interface UpdateUserStatusUseCaseResponse {
  user: SafeUser;
}

export class UpdateUserStatusUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    targetUserId,
    newStatus,
    currentAdminId,
  }: UpdateUserStatusUseCaseRequest): Promise<UpdateUserStatusUseCaseResponse> {
    const user = await this.usersDaf.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Se o usuário for admin e estiver sendo suspenso, verificar se é o último admin ativo
    if (user.role === 'admin' && newStatus === 'suspended') {
      const activeAdminsCount = await this.usersDaf.countActiveAdmins();
      if (activeAdminsCount <= 1) {
        throw new LastAdminError();
      }
    }

    const updated = await this.usersDaf.updateStatus(targetUserId, newStatus);

    // Se a conta for suspensa, revoga imediatamente todos os tokens e sessões
    if (newStatus === 'suspended') {
      await this.usersDaf.incrementTokenVersion(targetUserId);
    }

    return {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }
}
