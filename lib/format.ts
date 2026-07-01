/**
 * Display formatting helpers for the Home screen (presentation only).
 */
import { DAY_MS, HOUR_MS, MINUTE_MS, MONTH_MS, WEEK_MS, YEAR_MS } from '@/constants/time';

/** "$1,234" — floored whole units with thousands separators. */
export function formatMoney(n: number): string {
  return '$' + Math.max(0, Math.floor(n)).toLocaleString('en-US');
}

/** Time-to-next-milestone copy (matches the locked design wording). */
export function remainingText(remainingMs: number): string {
  const remDays = Math.max(0, remainingMs) / DAY_MS;
  if (remDays < 1) return `in ${Math.max(1, Math.ceil(remDays * 24))}h`;
  if (remDays < 2) return `in 1d ${Math.round((remDays - 1) * 24)}h`;
  return `${Math.ceil(remDays)} days to go`;
}

export function durationLabel(ms: number): string {
  const units: [number, string][] = [
    [YEAR_MS, 'year'],
    [MONTH_MS, 'month'],
    [WEEK_MS, 'week'],
    [DAY_MS, 'day'],
    [HOUR_MS, 'hour'],
    [MINUTE_MS, 'minute'],
  ];
  for (const [unit, name] of units) {
    if (ms >= unit) {
      const n = Math.round(ms / unit);
      return `${n} ${name}${n === 1 ? '' : 's'}`;
    }
  }
  return 'now';
}

export function countdownLabel(inMs: number): string {
  const d = Math.max(0, inMs) / DAY_MS;
  if (d < 1) return 'soon';
  if (d < 30) return `${Math.ceil(d)}d left`;
  if (d < 365) return `${Math.ceil(d / 7)}w left`;
  return `${Math.ceil(d / 30)}mo left`;
}
