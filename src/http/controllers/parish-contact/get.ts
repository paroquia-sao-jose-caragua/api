import { getAppContext } from '@/http/utils/getAppContext';
import { makeGetParishContactUseCase } from '@/use-cases/factories/parish-contact/make-get-parish-contact-use-case';

export const getParishContact: ControllerFn = async (c) => {
  const getUseCase = makeGetParishContactUseCase(c);

  const { contact } = await getUseCase.execute();

  return c.json({
    contact: contact || {
      id: 'primary',
      phone: '(12) 3883-4888',
      whatsapp: '(12) 98170-5757',
      email: 'contato@paroquiasaojosecaragua.org.br',
      address: 'R. Edson dos Santos, 30 — Morro do Algodão, Caraguatatuba - SP, 11671-180',
      officeHours: 'Terça a sexta-feira: 09h às 12h e 14h às 17h40\nSábado: 08h às 12h',
      instagramUrl: 'https://www.instagram.com/paroquiasaojosecaragua/',
      youtubeUrl: 'https://www.youtube.com/@paroquiasaojosecaragua',
      facebookUrl: 'https://www.facebook.com/parsaojose/?locale=pt_BR',
      whatsappUrl: 'https://wa.me/5512981705757',
    },
  });
};
