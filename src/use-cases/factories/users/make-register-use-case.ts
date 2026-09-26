import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { RegisterUseCase } from '@/use-cases/users/register';

export function makeRegisterUseCase(c: DomainContext) {
  const userDaf = new D1UsersDAF(c.env.DB);
  const registerUseCase = new RegisterUseCase(userDaf);

  return registerUseCase;
}
