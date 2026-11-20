import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { UpdateUserUseCase } from '@/use-cases/users/update-user';

export function makeUpdateUserUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  const pastoralAgentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  return new UpdateUserUseCase(usersDaf, pastoralAgentsDaf);
}
