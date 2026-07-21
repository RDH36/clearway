import { DAY_MS } from '@/constants/time';

export const TRIAL_MS = 3 * DAY_MS;

export function trialRemainingMs(trialStartedAt: number | null, now: number): number {
  if (trialStartedAt == null) return 0;
  return Math.max(0, trialStartedAt + TRIAL_MS - now);
}

type PersistedPremiumState = {
  entitledCached?: boolean;
  trialStartedAt?: number | null;
};

export function premiumFromPersisted(state: PersistedPremiumState | null | undefined): boolean {
  if (!state) return false;
  return Boolean(state.entitledCached) || trialRemainingMs(state.trialStartedAt ?? null, Date.now()) > 0;
}
