import type { Context } from 'hono';
import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { GetUserUseCase } from '@/use-cases/users/get-user';

export const makeGetUserUseCase = (c: Context) => {
  const usersDaf = new D1UsersDAF(c.env.DB);
  return new GetUserUseCase(usersDaf);
};
