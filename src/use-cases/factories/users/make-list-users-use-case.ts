import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { ListUsersUseCase } from '@/use-cases/users/list-users';

export function makeListUsersUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new ListUsersUseCase(usersDaf);
}
