import type { UsersDAF } from '@/services/database/users-daf';
import type { User } from '@/entities/user';
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists-error';
import { hashPassword } from 'serverless-crypto-utils/password-hashing';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'viewer';
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    name,
    email,
    password,
    role,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSameEmail = await this.usersDaf.findByEmail(email);

    if (userWithSameEmail) {
      throw new ResourceAlreadyExistsError();
    }

    const passwordHash = await hashPassword(password);

    const user = await this.usersDaf.create({
      id: ulid(),
      name,
      email,
      passwordHash,
      role,
    });

    return { user };
  }
}
