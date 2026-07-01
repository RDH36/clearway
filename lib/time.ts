/**
 * Time-clean math (spec §3 / §1). Everything derives from `quitTimestamp` and
 * `Date.now()` at call time — we NEVER store or increment a running counter, so
 * the value stays correct across backgrounding, restarts, and the widget.
 */
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from '@/constants/time';

export type CleanParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Milliseconds clean. `now` is injectable for tests/derivations but defaults to
 * Date.now() so the home counter re-derives on every tick. Null quit → 0.
 */
export function msClean(quitTimestamp: number | null, now: number = Date.now()): number {
  if (quitTimestamp == null) return 0;
  return Math.max(0, now - quitTimestamp);
}

/** Break a clean duration into whole days / hours / minutes / seconds. */
export function formatClean(ms: number): CleanParts {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / DAY_MS),
    hours: Math.floor((safe % DAY_MS) / HOUR_MS),
    minutes: Math.floor((safe % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((safe % MINUTE_MS) / SECOND_MS),
  };
}
