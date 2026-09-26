import type { UsersDAF } from '@/services/database/users-daf';
import { hashPassword, verifyPassword } from 'serverless-crypto-utils/password-hashing';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { InvalidCurrentPasswordError } from '../errors/invalid-current-password-error';

interface ChangePasswordUseCaseRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordUseCaseResponse {
  success: boolean;
}

export class ChangePasswordUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
    const user = await this.usersDaf.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const isValidCurrentPassword = await verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isValidCurrentPassword) {
      throw new InvalidCurrentPasswordError();
    }

    const newPasswordHash = await hashPassword(newPassword);

    await this.usersDaf.updatePassword(user.id, newPasswordHash);

    // Invalida sessões em outros dispositivos
    await this.usersDaf.incrementTokenVersion(user.id);

    return { success: true };
  }
}
