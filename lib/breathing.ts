/**
 * Breathing drivers — pure logic, no animation. The craving orb (Reanimated) and
 * the per-phase chime read from `phaseAt`; this module just answers "where in
 * the cycle are we at elapsed ms?" for the selected pattern. 4-7-8 is the free
 * core; the extra patterns are part of the premium craving kit.
 */
import { SECOND_MS } from '@/constants/time';

export type BreathPhase = 'inhale' | 'hold' | 'exhale';

export type BreathStep = {
  phase: BreathPhase;
  durationMs: number;
  label: string;
};

export type PatternId = 'calm478' | 'box' | 'coherent';

export type BreathPattern = {
  id: PatternId;
  name: string;
  eyebrow: string;
  sub: string;
  premium: boolean;
  steps: BreathStep[];
};

const step = (phase: BreathPhase, seconds: number): BreathStep => ({
  phase,
  durationMs: seconds * SECOND_MS,
  label: phase === 'inhale' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out',
});

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'calm478',
    name: '4-7-8 calm',
    eyebrow: '4 · 7 · 8 breathing',
    sub: 'The classic — slows the spike fast',
    premium: false,
    steps: [step('inhale', 4), step('hold', 7), step('exhale', 8)],
  },
  {
    id: 'box',
    name: 'Box breathing',
    eyebrow: '4 · 4 · 4 · 4 box',
    sub: 'Steady square rhythm for sharp urges',
    premium: true,
    steps: [step('inhale', 4), step('hold', 4), step('exhale', 4), step('hold', 4)],
  },
  {
    id: 'coherent',
    name: 'Coherent 5·5',
    eyebrow: '5 · 5 coherent',
    sub: 'Even waves for the long cravings',
    premium: true,
    steps: [step('inhale', 5), step('exhale', 5)],
  },
];

export const DEFAULT_PATTERN = BREATH_PATTERNS[0];

export const patternById = (id: PatternId): BreathPattern =>
  BREATH_PATTERNS.find((p) => p.id === id) ?? DEFAULT_PATTERN;

export const cycleMs = (pattern: BreathPattern) =>
  pattern.steps.reduce((total, s) => total + s.durationMs, 0);

export const BREATH_PHASES = DEFAULT_PATTERN.steps;
export const BREATH_CYCLE_MS = cycleMs(DEFAULT_PATTERN);

export type BreathState = BreathStep & {
  /** ms elapsed within the current phase */
  phaseElapsedMs: number;
  /** 0 → 1 progress through the current phase (drives orb expand/contract) */
  progress: number;
  /** how many full cycles have completed */
  cycle: number;
};

/**
 * Resolve the breathing state at `elapsedMs` since the exercise started.
 * Loops forever; negative input clamps to the start.
 */
export function phaseAt(elapsedMs: number, pattern: BreathPattern = DEFAULT_PATTERN): BreathState {
  const total = cycleMs(pattern);
  const safe = Math.max(0, elapsedMs);
  const cycle = Math.floor(safe / total);
  let t = safe - cycle * total;

  for (const s of pattern.steps) {
    if (t < s.durationMs) {
      return {
        ...s,
        phaseElapsedMs: t,
        progress: t / s.durationMs,
        cycle,
      };
    }
    t -= s.durationMs;
  }

  const first = pattern.steps[0];
  return { ...first, phaseElapsedMs: 0, progress: 0, cycle: cycle + 1 };
}
