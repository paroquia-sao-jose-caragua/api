export const logWithDiscord = async ({
  data,
  error,
  env,
}: {
  data: object;
  error?: unknown;
  env: Bindings;
}) => {
  if (!env.ERROR_LOGGER_API_URL) return;

  const errorObject =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : String(error);

  const log = {
    data,
    error: errorObject,
  };

  const now = new Date().toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'America/Sao_Paulo',
  });

  await fetch(env.ERROR_LOGGER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `🚨 **Error on API [${env.ENVIRONMENT.toUpperCase()}]**\n${now}`,
      embeds: [
        {
          color: 16711680,
          description: `\`\`\`json\n${JSON.stringify(log, null, 2)}\n\`\`\``,
        },
      ],
    }),
  });
};
