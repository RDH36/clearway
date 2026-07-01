/**
 * Money-saved math (spec §3). Derived from the clean duration, so it stays in
 * lock-step with the counter.
 */
import { WEEK_MS } from '@/constants/time';

/** Money not spent so far: a linear fraction of the user's weekly spend. */
export function moneySaved(weeklySpend: number, msClean: number): number {
  if (weeklySpend <= 0 || msClean <= 0) return 0;
  return weeklySpend * (msClean / WEEK_MS);
}

/** Projected savings over a year — used in the WOW moment + solution bridge. */
export function projectedYear(weeklySpend: number): number {
  if (weeklySpend <= 0) return 0;
  return weeklySpend * 52;
}
