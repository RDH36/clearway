/**
 * Live 4-7-8 phase readout for the craving screen. Ticks a JS clock over
 * `phaseAt` (lib/breathing) to surface the guiding label + per-phase countdown,
 * and plays the soft chime on each phase change when `sound` is on. The orb reads
 * the returned `phase` and animates its scale on the same clock (see BreathingOrb).
 */
import { useEffect, useRef, useState } from 'react';
import { phaseAt, type BreathPhase } from '@/lib/breathing';
import { playBreathCue } from '@/lib/sound';

export type BreathView = { label: string; count: number; phase: BreathPhase };

const viewAt = (elapsedMs: number): BreathView => {
  const s = phaseAt(elapsedMs);
  return { label: s.label, count: Math.max(1, Math.ceil((s.durationMs - s.phaseElapsedMs) / 1000)), phase: s.phase };
};

export function useBreathPhase(sound = false, active = true): BreathView {
  const [view, setView] = useState<BreathView>(() => viewAt(0));
  const start = useRef(0);
  const prevPhase = useRef<BreathPhase | null>(null);
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    if (!active) return;
    start.current = Date.now();
    prevPhase.current = null;

    const id = setInterval(() => {
      const next = viewAt(Date.now() - start.current);
      if (soundRef.current && prevPhase.current !== null && prevPhase.current !== next.phase) {
        playBreathCue();
      }
      prevPhase.current = next.phase;
      setView((prev) => (prev.phase === next.phase && prev.count === next.count ? prev : next));
    }, 120);

    return () => clearInterval(id);
  }, [active]);

  return view;
}
