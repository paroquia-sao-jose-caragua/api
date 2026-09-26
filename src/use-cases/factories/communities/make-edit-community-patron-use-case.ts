import type { Context } from 'hono';
import { D1AttachmentsDAF } from '@/services/database/d1/d1-attachments-daf';
import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { EditCommunityPatronUseCase } from '@/use-cases/communities/edit-community-patron';

export const makeEditCommunityPatronUseCase = (c: Context) => {
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);
  const attachmentsDaf = new D1AttachmentsDAF(c.env.DB);

  return new EditCommunityPatronUseCase(communitiesDaf, attachmentsDaf);
};
