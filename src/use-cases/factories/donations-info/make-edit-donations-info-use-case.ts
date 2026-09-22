import type { Context } from 'hono';
import { D1DonationsInfoDAF } from '@/services/database/d1/d1-donations-info-daf';
import { EditDonationsInfoUseCase } from '@/use-cases/donations-info/edit-donations-info';

export const makeEditDonationsInfoUseCase = (c: Context) => {
  const donationsInfoDAF = new D1DonationsInfoDAF(c.env.DB);
  return new EditDonationsInfoUseCase(donationsInfoDAF);
};
