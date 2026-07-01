/**
 * Time constants in milliseconds — the single source of truth for every
 * timestamp derivation (spec §1: everything derives from `quitTimestamp`).
 *
 * Month and year use calendar approximations (30d / 365d) for milestone and
 * health thresholds. Note: money's projectedYear uses ×52 weeks per spec §3,
 * intentionally independent of YEAR_MS.
 */
export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
export const MONTH_MS = 30 * DAY_MS;
export const YEAR_MS = 365 * DAY_MS;
