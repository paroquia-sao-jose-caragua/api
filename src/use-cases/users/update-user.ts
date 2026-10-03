import type { UsersDAF } from '@/services/database/users-daf';
import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists-error';
import type { SafeUser } from './list-users';

interface UpdateUserUseCaseRequest {
  id: string;
  name: string;
  email: string;
}

interface UpdateUserUseCaseResponse {
  user: SafeUser;
}

export class UpdateUserUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private pastoralAgentsDaf?: PastoralAgentsDAF,
  ) {}

  async execute({
    id,
    name,
    email,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersDaf.findById(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail !== user.email.toLowerCase()) {
      const existingUserWithEmail =
        await this.usersDaf.findByEmail(normalizedEmail);

      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new ResourceAlreadyExistsError();
      }
    }

    const updated = await this.usersDaf.update(id, {
      name: trimmedName,
      email: normalizedEmail,
    });

    // Se houver um agente pastoral associado a este usuário, mantém os dados sincronizados
    if (this.pastoralAgentsDaf) {
      const linkedAgent = await this.pastoralAgentsDaf.findByUserId(id);
      if (linkedAgent) {
        await this.pastoralAgentsDaf.save({
          ...linkedAgent,
          name: trimmedName,
          email: normalizedEmail,
        });
      }
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
