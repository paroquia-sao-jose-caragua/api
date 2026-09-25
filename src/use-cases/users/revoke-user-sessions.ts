import type { UsersDAF } from '@/services/database/users-daf';
import { UserNotFoundError } from '../errors/user-not-found-error';

interface RevokeUserSessionsUseCaseRequest {
  targetUserId: string;
}

interface RevokeUserSessionsUseCaseResponse {
  newTokenVersion: number;
}

export class RevokeUserSessionsUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    targetUserId,
  }: RevokeUserSessionsUseCaseRequest): Promise<RevokeUserSessionsUseCaseResponse> {
    const user = await this.usersDaf.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const newTokenVersion = await this.usersDaf.incrementTokenVersion(targetUserId);

    return { newTokenVersion };
  }
}
