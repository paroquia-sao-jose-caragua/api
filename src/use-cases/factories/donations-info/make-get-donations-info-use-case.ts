import type { Context } from 'hono';
import { D1DonationsInfoDAF } from '@/services/database/d1/d1-donations-info-daf';
import { GetDonationsInfoUseCase } from '@/use-cases/donations-info/get-donations-info';

export const makeGetDonationsInfoUseCase = (c: Context) => {
  const donationsInfoDAF = new D1DonationsInfoDAF(c.env.DB);
  return new GetDonationsInfoUseCase(donationsInfoDAF);
};
