import { getAppContext } from '@/http/utils/getAppContext';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

export const getAttachment: ControllerFn = async (c) => {
  const { t, params } = getAppContext(c);

  const { filename } = params;

  try {
    const object = await c.env.R2_BUCKET.get(filename);

    if (!object) {
      return c.json({ message: t('resource-not-found') }, 400);
    }

    c.header(
      'Content-type',
      object.httpMetadata?.contentType || 'application/octet-stream',
    );

    return c.body(object.body);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return c.json({ message: t('error-category-name-already-in-use') }, 400);
    }

    throw err;
  }
};
