import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { RevokeUserSessionsUseCase } from '@/use-cases/users/revoke-user-sessions';

export function makeRevokeUserSessionsUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new RevokeUserSessionsUseCase(usersDaf);
}
