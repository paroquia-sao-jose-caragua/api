import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { UpdateUserRoleUseCase } from '@/use-cases/users/update-user-role';

export function makeUpdateUserRoleUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new UpdateUserRoleUseCase(usersDaf);
}
