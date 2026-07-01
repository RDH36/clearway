/**
 * Haptics — thin wrapper over pulsar's preset library (spec §0b / §0).
 *
 * The rest of the app calls these named moments, never pulsar directly, so the
 * backing preset for any moment can be tuned in one place. `tap()` is wired into
 * PressablesConfig.globalHandlers.onPress so every press feels (spec §0b.2).
 *
 * Each call is guarded: pulsar needs its native module (dev build), so on a
 * surface without it (web) we no-op instead of throwing.
 *
 * Basic Android actuators (ERM, support level <= 1) can't render pulsar's subtle
 * iOS-style transients — `selection` / `impactSoft` come out imperceptible there.
 * On those we swap in the strongest single-click effect so every press is felt;
 * iOS and Android LRA keep the premium subtle presets.
 */
import { Platform } from 'react-native';
import { Presets, Settings } from 'react-native-pulsar';

let supportLevel = 3;
const weakAndroid = () => Platform.OS === 'android' && supportLevel <= 1;

function safe(label: string, run: () => void) {
  try {
    run();
  } catch (e) {
    console.warn(`[pulsar] ${label} failed →`, e);
  }
}

export function initHaptics() {
  try {
    Settings.enableHaptics(true);
    supportLevel = Settings.getHapticsSupportLevel() as unknown as number;
    console.log('[pulsar] enableHaptics(true) OK · support level =', supportLevel);
  } catch (e) {
    console.warn('[pulsar] init failed — native module not in this build; rebuild with `expo run:android`. →', e);
  }
}

export const haptics = {
  /** Global selection tick on every press. */
  tap: () =>
    safe('tap', () =>
      weakAndroid() ? Presets.System.Android.effectHeavyClick() : Presets.System.selection()
    ),
  /** Milestone reached — the pride beat. */
  milestone: () => safe('milestone', () => Presets.System.notificationSuccess()),
  /** A soft tick on each 4-7-8 breathing phase change. */
  breathPhase: () => safe('breathPhase', () => Presets.breath()),
  /** Gentle confirmation on reset / "I slipped". */
  resetConfirm: () =>
    safe('resetConfirm', () =>
      weakAndroid() ? Presets.System.Android.effectHeavyClick() : Presets.System.impactSoft()
    ),
  /** Confirmation on purchase success. */
  purchaseSuccess: () => safe('purchaseSuccess', () => Presets.System.notificationSuccess()),
};
