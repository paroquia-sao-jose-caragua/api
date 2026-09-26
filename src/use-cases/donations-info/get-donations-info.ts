import type { DonationsInfo } from '@/entities/donations-info';
import type { DonationsInfoDAF } from '@/services/database/donations-info-daf';

interface GetDonationsInfoUseCaseResponse {
  donations: DonationsInfo | null;
}

export class GetDonationsInfoUseCase {
  private donationsInfoDAF: DonationsInfoDAF;

  constructor(donationsInfoDAF: DonationsInfoDAF) {
    this.donationsInfoDAF = donationsInfoDAF;
  }

  async execute(): Promise<GetDonationsInfoUseCaseResponse> {
    const donations = await this.donationsInfoDAF.get();
    return { donations };
  }
}
