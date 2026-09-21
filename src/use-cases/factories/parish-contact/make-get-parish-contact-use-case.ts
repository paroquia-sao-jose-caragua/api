import type { Context } from 'hono';
import { D1ParishContactDAF } from '@/services/database/d1/d1-parish-contact-daf';
import { GetParishContactUseCase } from '@/use-cases/parish-contact/get-parish-contact';

export const makeGetParishContactUseCase = (c: Context) => {
  const parishContactDaf = new D1ParishContactDAF(c.env.DB);

  return new GetParishContactUseCase(parishContactDaf);
};
