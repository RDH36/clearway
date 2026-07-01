/**
 * Breathing cue sound — a soft bell chime played on each 4-7-8 phase change
 * (craving screen), replacing the haptic. One reused player, guarded so a build
 * without the native audio module simply no-ops instead of throwing.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let cue: AudioPlayer | null = null;

function ensure(): AudioPlayer | null {
  if (cue) return cue;
  try {
    cue = createAudioPlayer(require('../assets/audio/breath-cue.mp3'));
    cue.volume = 0.7;
    setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    console.warn('[sound] init failed — native module not in this build; rebuild with `expo run:android`. →', e);
  }
  return cue;
}

/** Warm the player so the first cue has no load delay. */
export function primeBreathCue() {
  ensure();
}

/** Play the phase-change cue from the start. */
export function playBreathCue() {
  const p = ensure();
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch (e) {
    console.warn('[sound] play failed →', e);
  }
}
