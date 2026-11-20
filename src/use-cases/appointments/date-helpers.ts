export function getBrazilNowParts(now: Date = new Date()): {
  todayDate: string;
  currentMinutes: number;
} {
  const nowBrazilStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);

  // format: "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
  const [todayDate, nowTimePart] = nowBrazilStr.split(/,?\s+/);
  let currentMinutes = 0;

  if (nowTimePart) {
    const [hours, minutes] = nowTimePart.split(':').map(Number);
    currentMinutes = hours * 60 + minutes;
  }

  return { todayDate, currentMinutes };
}
