import type { Lang } from '../i18n';

const DAY_MS = 86_400_000;

export function ymdInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function ymdToUtc(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Calendar day number in `timeZone`, where `startYmd` itself is day 1. */
export function dayNumberSince(startYmd: string, now: Date, timeZone: string): number {
  return Math.round((ymdToUtc(ymdInZone(now, timeZone)) - ymdToUtc(startYmd)) / DAY_MS) + 1;
}

export function countdownTo(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms % DAY_MS) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    done: false,
  };
}

export function zoneOffsetMinutes(timeZone: string, date: Date): number {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

export function hoursApart(zoneA: string, zoneB: string, date: Date): number {
  return Math.abs(zoneOffsetMinutes(zoneA, date) - zoneOffsetMinutes(zoneB, date)) / 60;
}

export function clockIn(timeZone: string, date: Date, lang: Lang) {
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const time = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  const day = new Intl.DateTimeFormat(locale, { timeZone, month: 'short', day: 'numeric', weekday: 'short' }).format(date);
  const hour = Number(time.slice(0, 2));
  return { time, day, hour, isDay: hour >= 6 && hour < 18 };
}

export function formatDate(ymd: string, lang: Lang): string {
  const d = new Date(ymdToUtc(ymd));
  if (lang === 'zh') return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}
