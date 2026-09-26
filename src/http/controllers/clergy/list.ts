import { makeListClergyUseCase } from '@/use-cases/factories/clergy/make-list-clergy-use-case';

export const listClergy: ControllerFn = async (c) => {
  const listClergyUseCase = makeListClergyUseCase(c);

  const { clergy } = await listClergyUseCase.execute();

  const formattedClergy = clergy.map((item) => ({
    ...item,
    photoUrl: item.photoId
      ? item.photoId.startsWith('http://') ||
        item.photoId.startsWith('https://') ||
        item.photoId.startsWith('/')
        ? item.photoId
        : `${c.env.S3_API_URL}/${item.photoId}`
      : item.photoUrl || null,
  }));

  return c.json({ clergy: formattedClergy });
};
