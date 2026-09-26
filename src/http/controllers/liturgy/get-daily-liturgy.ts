export const getDailyLiturgy: ControllerFn = async (c) => {
  const queryDate = c.req.query('date');
  
  // Format target date (YYYY-MM-DD)
  let dateObj = new Date();
  if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
    const [y, m, d] = queryDate.split('-').map(Number);
    dateObj = new Date(y, m - 1, d);
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${year}-${month}-${day}`;

  const cacheKey = `daily-liturgy:${formattedDate}`;

  // Try Cloudflare KV Cache if configured
  try {
    if (c.env.CACHE_KV) {
      const cached = await c.env.CACHE_KV.get(cacheKey, 'json');
      if (cached) {
        return c.json(cached);
      }
    }
  } catch (e) {
    // Ignore cache error and proceed to fetch
  }

  try {
    // Fetch from public Liturgia API v2 (Dancrf / Railway)
    const targetUrl = `https://liturgia.up.railway.app/v2/?dia=${day}&mes=${month}`;
    const res = await fetch(targetUrl);

    if (!res.ok) {
      throw new Error(`Liturgia API responded with status ${res.status}`);
    }

    const data = (await res.json()) as any;
    const leituras = data.leituras || {};

    const pLeitura = Array.isArray(leituras.primeiraLeitura)
      ? leituras.primeiraLeitura[0]
      : leituras.primeiraLeitura || data.primeiraLeitura;

    const sLeitura = Array.isArray(leituras.segundaLeitura)
      ? leituras.segundaLeitura[0]
      : leituras.segundaLeitura || data.segundaLeitura;

    const salmoItem = Array.isArray(leituras.salmo)
      ? leituras.salmo[0]
      : leituras.salmo || data.salmo;

    const evangelhoItem = Array.isArray(leituras.evangelho)
      ? leituras.evangelho[0]
      : leituras.evangelho || data.evangelho;

    const secondReading =
      sLeitura && (sLeitura.texto || sLeitura.referencia)
        ? {
            reference: sLeitura.referencia || '',
            title: sLeitura.titulo || '2ª Leitura',
            text: sLeitura.texto || '',
          }
        : null;

    const reflectionText =
      typeof data.reflexao === 'string'
        ? data.reflexao
        : data.reflexao?.texto || null;

    const saintData = data.santo || data.santosDoDia || data.santoDoDia;
    const saint =
      saintData && (saintData.nome || saintData.texto || typeof saintData === 'string')
        ? {
            name: typeof saintData === 'string' ? saintData : saintData.nome || '',
            description: typeof saintData === 'string' ? '' : saintData.texto || saintData.descricao || '',
            image: typeof saintData === 'string' ? null : saintData.imagem || null,
          }
        : null;

    // Normalize response for our site layout
    const result = {
      date: formattedDate,
      displayDate: data.data || `${day}/${month}/${year}`,
      liturgy: data.liturgia || 'Liturgia do Dia',
      color: data.cor || 'Verde',
      firstReading: {
        reference: pLeitura?.referencia || '',
        title: pLeitura?.titulo || '1ª Leitura',
        text: pLeitura?.texto || '',
      },
      secondReading,
      psalm: {
        reference: salmoItem?.referencia || '',
        response: salmoItem?.refrao || '',
        text: salmoItem?.texto || '',
      },
      gospel: {
        reference: evangelhoItem?.referencia || '',
        title: evangelhoItem?.titulo || 'Evangelho',
        text: evangelhoItem?.texto || '',
      },
      reflection: reflectionText ? { text: reflectionText } : null,
      saint,
    };

    // Store in KV cache for 24 hours (86400 seconds)
    try {
      if (c.env.CACHE_KV) {
        await c.env.CACHE_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 });
      }
    } catch (e) {
      // Ignore cache put failure
    }

    return c.json(result);
  } catch (err: any) {
    return c.json(
      {
        error: 'Liturgia indisponível no momento.',
        details: err?.message || String(err),
      },
      502,
    );
  }
};
