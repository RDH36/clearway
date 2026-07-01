/**
 * 4-7-8 breathing driver (spec §3) — pure logic, no animation. The craving orb
 * (Reanimated) and the per-phase haptic read from `phaseAt`; this module just
 * answers "where in the cycle are we at elapsed ms?".
 */
import { SECOND_MS } from '@/constants/time';

export type BreathPhase = 'inhale' | 'hold' | 'exhale';

export type BreathStep = {
  phase: BreathPhase;
  durationMs: number;
  label: string;
};

export const BREATH_PHASES: BreathStep[] = [
  { phase: 'inhale', durationMs: 4 * SECOND_MS, label: 'Breathe in' },
  { phase: 'hold', durationMs: 7 * SECOND_MS, label: 'Hold' },
  { phase: 'exhale', durationMs: 8 * SECOND_MS, label: 'Breathe out' },
];

export const BREATH_CYCLE_MS = BREATH_PHASES.reduce(
  (total, p) => total + p.durationMs,
  0
); // 19s

export type BreathState = BreathStep & {
  /** ms elapsed within the current phase */
  phaseElapsedMs: number;
  /** 0 → 1 progress through the current phase (drives orb expand/contract) */
  progress: number;
  /** how many full 4-7-8 cycles have completed */
  cycle: number;
};

/**
 * Resolve the breathing state at `elapsedMs` since the exercise started.
 * Loops forever; negative input clamps to the start.
 */
export function phaseAt(elapsedMs: number): BreathState {
  const safe = Math.max(0, elapsedMs);
  const cycle = Math.floor(safe / BREATH_CYCLE_MS);
  let t = safe - cycle * BREATH_CYCLE_MS;

  for (const step of BREATH_PHASES) {
    if (t < step.durationMs) {
      return {
        ...step,
        phaseElapsedMs: t,
        progress: t / step.durationMs,
        cycle,
      };
    }
    t -= step.durationMs;
  }

  // Exact cycle boundary — treat as the start of the next inhale.
  const first = BREATH_PHASES[0];
  return { ...first, phaseElapsedMs: 0, progress: 0, cycle: cycle + 1 };
}
