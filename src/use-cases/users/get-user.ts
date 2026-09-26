import type { UsersDAF } from '@/services/database/users-daf';
import type { User } from '@/entities/user';
import { UserNotFoundError } from '../errors/user-not-found-error';

interface GetUserUseCaseRequest {
  id: string;
}

interface GetUserUseCaseResponse {
  user: User;
}

export class GetUserUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    id,
  }: GetUserUseCaseRequest): Promise<GetUserUseCaseResponse> {
    const user = await this.usersDaf.findById(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return { user };
  }
}
