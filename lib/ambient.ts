import { AppState } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let bed: AudioPlayer | null = null;

function ensure(): AudioPlayer | null {
  if (bed) return bed;
  try {
    bed = createAudioPlayer(require('../assets/audio/ambient-air.mp3'));
    bed.loop = true;
    bed.volume = 0.3;
    setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    console.warn('[ambient] init failed →', e);
  }
  return bed;
}

export function playAmbient() {
  const p = ensure();
  if (!p) return;
  try {
    p.play();
  } catch (e) {
    console.warn('[ambient] play failed →', e);
  }
}

export function stopAmbient() {
  if (!bed) return;
  try {
    bed.pause();
    bed.seekTo(0);
  } catch {
    return;
  }
}

AppState.addEventListener('change', (state) => {
  if (state !== 'active') stopAmbient();
});
