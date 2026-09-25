import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { UpdateUserStatusUseCase } from '@/use-cases/users/update-user-status';

export function makeUpdateUserStatusUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new UpdateUserStatusUseCase(usersDaf);
}
