/**
 * Display formatting helpers for the Home screen (presentation only).
 */
import { DAY_MS } from '@/constants/time';

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
