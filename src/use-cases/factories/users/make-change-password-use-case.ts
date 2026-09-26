import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { ChangePasswordUseCase } from '@/use-cases/users/change-password';

export function makeChangePasswordUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new ChangePasswordUseCase(usersDaf);
}
