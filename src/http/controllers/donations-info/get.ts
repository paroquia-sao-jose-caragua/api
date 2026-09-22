import { makeGetDonationsInfoUseCase } from '@/use-cases/factories/donations-info/make-get-donations-info-use-case';

export const getDonationsInfo: ControllerFn = async (c) => {
  const getUseCase = makeGetDonationsInfoUseCase(c);

  const { donations } = await getUseCase.execute();

  return c.json({
    donations: donations || {
      id: 'primary',
      pixKey: '(12) 98170-5757',
      pixKeyType: 'phone',
      pixReceiverName: 'Paroquia Sao Jose',
      pixReceiverCity: 'Caraguatatuba',
      bankName: 'Santander',
      bankAgency: '4171',
      bankAccount: '13002394-1',
      bankAccountType: 'Conta Corrente',
      bankCnpj: '03.167.725/0017-24',
      bankBeneficiary: 'Diocese de Caraguatatuba - Paróquia São José',
      receiptWhatsapp: '(12) 98170-5757',
      receiptWhatsappUrl: 'https://wa.me/5512981705757',
      receiptEmail: 'contato@paroquiasaojosecaragua.org.br',
      title: 'Contribua com as obras e missões da Paróquia São José',
      description:
        'Cada contribuição é um ato de fé e solidariedade, fortalecendo a missão da paróquia e o trabalho pastoral em nossa comunidade.',
      pastoralCenterTitle: 'Centro Pastoral da Paróquia São José',
      pastoralCenterDescription:
        'Com fé e dedicação, estamos dando vida ao Centro Pastoral da Paróquia São José — um espaço para evangelização, formação e convivência cristã. A boa fé de cada doador permitiu erguermos um local que acolhe a comunidade, promove encontros e fortalece a missão pastoral.',
    },
  });
};
