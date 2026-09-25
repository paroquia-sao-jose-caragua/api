import type { UsersDAF } from '@/services/database/users-daf';
import type { UserRole } from '@/entities/user';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { LastAdminError } from '../errors/last-admin-error';
import type { SafeUser } from './list-users';

interface UpdateUserRoleUseCaseRequest {
  targetUserId: string;
  newRole: UserRole;
  currentAdminId: string;
}

interface UpdateUserRoleUseCaseResponse {
  user: SafeUser;
}

export class UpdateUserRoleUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    targetUserId,
    newRole,
    currentAdminId,
  }: UpdateUserRoleUseCaseRequest): Promise<UpdateUserRoleUseCaseResponse> {
    const user = await this.usersDaf.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Se o usuário alvo for admin e estiver mudando para outro papel, verificar se é o último admin ativo
    if (user.role === 'admin' && newRole !== 'admin') {
      const activeAdminsCount = await this.usersDaf.countActiveAdmins();
      if (activeAdminsCount <= 1) {
        throw new LastAdminError();
      }
    }

    const updated = await this.usersDaf.updateRole(targetUserId, newRole);

    // Invalida sessões do usuário para atualizar os novos privilégios na próxima requisição
    await this.usersDaf.incrementTokenVersion(targetUserId);

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
