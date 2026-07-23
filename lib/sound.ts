import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { BreathPhase } from '@/lib/breathing';

const SOURCES: Record<BreathPhase, number> = {
  inhale: require('../assets/audio/voice-in.mp3'),
  hold: require('../assets/audio/voice-hold.mp3'),
  exhale: require('../assets/audio/voice-out.mp3'),
};

const players: Partial<Record<BreathPhase, AudioPlayer>> = {};

function ensure(phase: BreathPhase): AudioPlayer | null {
  if (players[phase]) return players[phase] ?? null;
  try {
    const p = createAudioPlayer(SOURCES[phase]);
    p.volume = 0.85;
    players[phase] = p;
    setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    console.warn('[sound] init failed — native module not in this build; rebuild with `expo run:android`. →', e);
  }
  return players[phase] ?? null;
}

export function primeBreathCue() {
  (['inhale', 'hold', 'exhale'] as BreathPhase[]).forEach(ensure);
}

export function playBreathCue(phase: BreathPhase = 'inhale') {
  const p = ensure(phase);
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch (e) {
    console.warn('[sound] play failed →', e);
  }
}
