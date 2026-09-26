import type { Context } from 'hono';
import { D1ParishContactDAF } from '@/services/database/d1/d1-parish-contact-daf';
import { EditParishContactUseCase } from '@/use-cases/parish-contact/edit-parish-contact';

export const makeEditParishContactUseCase = (c: Context) => {
  const parishContactDaf = new D1ParishContactDAF(c.env.DB);

  return new EditParishContactUseCase(parishContactDaf);
};
