import type { UsersDAF } from '@/services/database/users-daf';
import type { User } from '@/entities/user';
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { verifyPassword } from 'serverless-crypto-utils/password-hashing';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
}

export class AuthenticateUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersDaf.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    return { user };
  }
}
