/**
 * The clearing atmosphere (design brief §2 "the air clears" / spec §9).
 * Pure derivation from the clean duration: hazy + grey at day 0, deep petrol with
 * an aqua sky and a dawn horizon at long streaks. Mirrors the locked 1b design math.
 */
import { DAY_MS } from '@/constants/time';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** 0 (thick haze, day 0) → 1 (clear air). Asymptotic, ~22-day time constant. */
export function clarity(msClean: number): number {
  const daysFloat = Math.max(0, msClean) / DAY_MS;
  return clamp01(1 - Math.exp(-daysFloat / 22));
}

/** Linear hex interpolation → an `rgb(r,g,b)` string (t clamped 0..1). */
export function lerpHex(a: string, b: string, t: number): string {
  const k = clamp01(t);
  const ch = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = ch(a);
  const [br, bg, bb] = ch(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * k);
  return `rgb(${m(ar, br)},${m(ag, bg)},${m(ab, bb)})`;
}

export type Atmosphere = {
  clarity: number;
  depth: { top: string; mid: string; bot: string };
  aqua: { opacity: number; ry: number };
  horizon: { opacity: number; ry: number };
  fog: { opacity: number };
  hazeSheet: { opacity: number };
};

/** All five layer parameters for a given clean duration (or a fixed clarityOverride). */
export function getAtmosphere(
  msClean: number,
  hazeIntensity = 1,
  clarityOverride?: number
): Atmosphere {
  const c = clarityOverride ?? clarity(msClean);
  const ec = Math.pow(c, 0.85);
  const haze = Math.min(1, (1 - c) * hazeIntensity);
  const dawnEase = Math.pow(c, 1.3);

  return {
    clarity: c,
    depth: {
      top: lerpHex('#3C4D51', '#071318', ec),
      mid: lerpHex('#404F51', '#0B1E22', ec),
      bot: lerpHex('#445350', '#123227', ec),
    },
    aqua: { opacity: 0.02 + ec * 0.34, ry: 55 + c * 35 },
    horizon: { opacity: dawnEase * 0.66, ry: 48 + c * 26 },
    fog: { opacity: Math.min(1, haze * 1.05) },
    hazeSheet: { opacity: Math.pow(haze, 0.85) * 0.78 },
  };
}
