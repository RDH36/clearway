/**
 * Live breathing readout for the craving screen. Ticks a JS clock over
 * `phaseAt` (lib/breathing) to surface the guiding label + per-phase countdown,
 * and plays the soft chime on each phase change when `sound` is on. The orb reads
 * the returned `phase`/`durationMs` and animates its scale on the same clock.
 */
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PATTERN, phaseAt, type BreathPattern, type BreathPhase } from '@/lib/breathing';
import { playBreathCue } from '@/lib/sound';

export type BreathView = { label: string; count: number; phase: BreathPhase; durationMs: number };

const viewAt = (elapsedMs: number, pattern: BreathPattern): BreathView => {
  const s = phaseAt(elapsedMs, pattern);
  return {
    label: s.label,
    count: Math.max(1, Math.ceil((s.durationMs - s.phaseElapsedMs) / 1000)),
    phase: s.phase,
    durationMs: s.durationMs,
  };
};

export function useBreathPhase(sound = false, active = true, pattern: BreathPattern = DEFAULT_PATTERN): BreathView {
  const [view, setView] = useState<BreathView>(() => viewAt(0, pattern));
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
      const next = viewAt(Date.now() - start.current, pattern);
      if (soundRef.current && prevPhase.current !== null && prevPhase.current !== next.phase) {
        playBreathCue(next.phase);
      }
      prevPhase.current = next.phase;
      setView((prev) =>
        prev.phase === next.phase && prev.count === next.count && prev.durationMs === next.durationMs
          ? prev
          : next
      );
    }, 120);

    return () => clearInterval(id);
  }, [active, pattern]);

  return view;
}
