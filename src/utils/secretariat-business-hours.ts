/**
 * Helpers for Paróquia São José notification windows in America/Sao_Paulo timezone.
 *
 * Secretariat working hours:
 * - Tuesday to Friday: 09:00–12:00 and 14:00–17:40
 * - Saturday: 08:00–12:00
 * - Sunday & Monday: closed
 *
 * Pastoral agent (Padre) daily digest:
 * - Tuesday to Friday (weekdays except Monday), around 17:00
 */

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getSaoPauloTimeParts(date = new Date()): {
  dayOfWeek: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const hourRaw = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  return {
    dayOfWeek: WEEKDAY_MAP[weekdayStr] ?? 0,
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute,
  };
}

export function isWithinSecretariatBusinessHours(date = new Date()): boolean {
  const { dayOfWeek, hour, minute } = getSaoPauloTimeParts(date);
  const totalMinutes = hour * 60 + minute;

  // Tuesday (2) to Friday (5): 09:00–12:00 and 14:00–17:40
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    const morning = totalMinutes >= 9 * 60 && totalMinutes <= 12 * 60;
    const afternoon = totalMinutes >= 14 * 60 && totalMinutes <= 17 * 60 + 40;
    return morning || afternoon;
  }

  // Saturday (6): 08:00–12:00
  if (dayOfWeek === 6) {
    return totalMinutes >= 8 * 60 && totalMinutes <= 12 * 60;
  }

  // Sunday (0) and Monday (1): closed
  return false;
}

export function isAgentDigestDay(date = new Date()): boolean {
  const { dayOfWeek } = getSaoPauloTimeParts(date);
  // Weekdays except Monday: Tuesday (2) to Friday (5)
  return dayOfWeek >= 2 && dayOfWeek <= 5;
}
