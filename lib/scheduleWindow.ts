import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { msClean } from '@/lib/time';
import { moneySaved } from '@/lib/money';
import { formatMoney } from '@/lib/format';
import { DAY_MS } from '@/constants/time';
import type { Motivation, Reason } from '@/store/useQuitStore';

// Android repeats a DAILY notification verbatim — body included — so a repeating
// trigger freezes the affirmation forever. Every reminder is scheduled instead as
// its own dated occurrence over a rolling window, refreshed whenever the app syncs.
export const WINDOW_DAYS = 7;

export function nextOccurrences(hhmm: string, count = WINDOW_DAYS, now = new Date()): Date[] {
  const [rawHour, rawMinute] = hhmm.split(':').map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 9;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;

  const first = new Date(now);
  first.setHours(hour, minute, 0, 0);
  if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1);

  return Array.from({ length: count }, (_, i) => {
    const at = new Date(first);
    at.setDate(first.getDate() + i);
    return at;
  });
}

export const occurrenceKey = (at: Date) =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;

export type AffirmationInput = {
  primaryMotivation: Motivation;
  reasons: Reason[];
  userName: string | null;
  weeklySpend: number;
  quitTimestamp: number | null;
};

export function affirmationAt(input: AffirmationInput, at: Date, seedShift = 0): string {
  const ms = msClean(input.quitTimestamp, at.getTime());
  const days = Math.max(1, Math.floor(ms / DAY_MS));
  return pickAffirmation({
    motivation: input.primaryMotivation,
    moment: 'general',
    seed: days + seedShift,
    reason: reasonLabel(input.reasons[0]?.title, input.primaryMotivation),
    days,
    money: formatMoney(moneySaved(input.weeklySpend, Math.max(ms, DAY_MS))),
    name: input.userName,
  }).text;
}
