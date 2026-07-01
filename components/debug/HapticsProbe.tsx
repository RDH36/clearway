/**
 * TEMP — pulsar haptics diagnostics. Shows the device support level and fires
 * individual presets so their real perceptibility can be judged per device.
 * Delete alongside app/debug.tsx.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Presets, Settings } from 'react-native-pulsar';
import { runOnUI } from 'react-native-worklets';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

const SUPPORT_LABELS = ['0 · NO_SUPPORT', '1 · LIMITED', '2 · STANDARD', '3 · ADVANCED'];

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View className="flex-row justify-between gap-3 py-0.5">
      <Text variant="body" className="flex-1 text-muted">{k}</Text>
      <Text variant="body" className="font-mono">{v}</Text>
    </View>
  );
}

export function HapticsProbe() {
  const [support, setSupport] = useState<number | null>(null);
  const [last, setLast] = useState('—');

  const readSupport = () => {
    try {
      Settings.enableHaptics(true);
      const lvl = Settings.getHapticsSupportLevel() as unknown as number;
      setSupport(lvl);
      setLast('enableHaptics(true) OK');
      console.log('[pulsar][probe] support level =', lvl);
    } catch (e) {
      setSupport(null);
      setLast(`init threw: ${String(e)}`);
      console.warn('[pulsar][probe] init THREW →', e);
    }
  };

  useEffect(readSupport, []);

  const fire = (name: string, run: () => void) => () => {
    try {
      run();
      setLast(`${name} → called, no throw`);
      console.log(`[pulsar][probe] ${name} → called OK (no throw)`);
    } catch (e) {
      setLast(`${name} THREW: ${String(e)}`);
      console.warn(`[pulsar][probe] ${name} THREW →`, e);
    }
  };

  const fireUI = (name: string, run: () => void) => () => {
    runOnUI(run)();
    setLast(`${name} (UI thread) → dispatched`);
    console.log(`[pulsar][probe] ${name} UI-thread dispatched`);
  };

  const level = support == null ? 'unavailable' : (SUPPORT_LABELS[support] ?? String(support));

  return (
    <View className="mb-5 rounded-card border border-line bg-surface p-4">
      <Text variant="label" className="mb-2 uppercase">HAPTICS PROBE — pulsar diagnostics</Text>
      <Row k="support level" v={level} />
      <Row k="last call" v={last} />
      <Text variant="label" className="mt-2">
        support 0 = pas de moteur haptique. Sur Android, active aussi Réglages → Sons →
        Vibrations → Retour tactile. Juger le rendu sur un vrai device (idéalement LRA/iPhone).
      </Text>
      <View className="mt-3 gap-2">
        <Button label="Re-read support level" variant="secondary" onPress={readSupport} />
        <Text variant="label" className="mt-1">Candidats pour le tick d&apos;appui — le plus LÉGER encore senti :</Text>
        <Button label="1 · effectTick" variant="secondary" onPress={fire('effectTick', () => Presets.System.Android.effectTick())} />
        <Button label="2 · effectClick" variant="secondary" onPress={fire('effectClick', () => Presets.System.Android.effectClick())} />
        <Button label="3 · impactLight" variant="secondary" onPress={fire('impactLight', () => Presets.System.impactLight())} />
        <Button label="4 · impactMedium" variant="secondary" onPress={fire('impactMedium', () => Presets.System.impactMedium())} />
        <Button label="5 · effectHeavyClick" variant="secondary" onPress={fire('effectHeavyClick', () => Presets.System.Android.effectHeavyClick())} />
        <Text variant="label" className="mt-2">Références :</Text>
        <Button label="selection (subtil)" variant="secondary" onPress={fire('selection', () => Presets.System.selection())} />
        <Button label="notificationSuccess" variant="secondary" onPress={fire('notificationSuccess', () => Presets.System.notificationSuccess())} />
        <Button label="⚡ selection · UI thread" onPress={fireUI('selection', () => { 'worklet'; Presets.System.selection(); })} />
        <Button label="⚡ effectClick · UI thread" variant="secondary" onPress={fireUI('effectClick', () => { 'worklet'; Presets.System.Android.effectClick(); })} />
      </View>
    </View>
  );
}
