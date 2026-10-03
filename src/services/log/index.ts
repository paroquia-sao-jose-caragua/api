import { logWithConsole } from './console';
import { logWithDiscord } from './discord';

export const log = async (params: {
  data: object;
  env: Bindings;
  error?: unknown;
}) => {
  if (params.env.ENVIRONMENT === 'development') {
    await logWithConsole(params);

    if (params.env.ERROR_LOGGER_API_URL) {
      try {
        await logWithDiscord(params);
      } catch (discordErr) {
        console.error('Failed to send error log to Discord:', discordErr);
      }
    }
    return;
  }

  return await logWithDiscord(params);
};
