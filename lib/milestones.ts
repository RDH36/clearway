/**
 * Milestones (spec §3). Ordered clean-time thresholds. Milestones past 1 month
 * are premium-locked — but the lock is cosmetic ("air not yet cleared", design
 * brief C2): the data still computes; premium just reveals it.
 */
import { DAY_MS, HOUR_MS, MONTH_MS, WEEK_MS, YEAR_MS } from '@/constants/time';

export type Milestone = {
  id: string;
  label: string;
  atMs: number;
  premiumLocked: boolean;
};

const THRESHOLDS: Omit<Milestone, 'premiumLocked'>[] = [
  { id: '1h', label: '1 hour', atMs: HOUR_MS },
  { id: '1d', label: '1 day', atMs: DAY_MS },
  { id: '3d', label: '3 days', atMs: 3 * DAY_MS },
  { id: '1w', label: '1 week', atMs: WEEK_MS },
  { id: '2w', label: '2 weeks', atMs: 2 * WEEK_MS },
  { id: '1mo', label: '1 month', atMs: MONTH_MS },
  { id: '3mo', label: '3 months', atMs: 3 * MONTH_MS },
  { id: '6mo', label: '6 months', atMs: 6 * MONTH_MS },
  { id: '1y', label: '1 year', atMs: YEAR_MS },
];

/** Anything strictly beyond 1 month is gated (1 month itself stays free). */
export const MILESTONES: Milestone[] = THRESHOLDS.map((m) => ({
  ...m,
  premiumLocked: m.atMs > MONTH_MS,
}));

/** All milestones whose threshold has been crossed. */
export function reached(msClean: number): Milestone[] {
  return MILESTONES.filter((m) => msClean >= m.atMs);
}

/** The highest milestone already reached, or null on day 0. */
export function current(msClean: number): Milestone | null {
  const hit = reached(msClean);
  return hit.length > 0 ? hit[hit.length - 1] : null;
}

/** The next milestone still ahead, or null once the last is reached. */
export function next(msClean: number): Milestone | null {
  return MILESTONES.find((m) => msClean < m.atMs) ?? null;
}

/** Next-milestone ring data: fraction filled since the previous threshold. */
export function progress(msClean: number): {
  next: Milestone | null;
  pct: number;
  remainingMs: number;
} {
  const nxt = next(msClean);
  const prevAtMs = current(msClean)?.atMs ?? 0;
  if (!nxt) return { next: null, pct: 1, remainingMs: 0 };
  const span = nxt.atMs - prevAtMs;
  const pct = span > 0 ? Math.max(0, Math.min(1, (msClean - prevAtMs) / span)) : 1;
  return { next: nxt, pct, remainingMs: Math.max(0, nxt.atMs - msClean) };
}
