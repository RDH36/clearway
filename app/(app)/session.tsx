import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { BreathingOrb } from '@/components/craving/BreathingOrb';
import { Cta } from '@/components/onboarding/Cta';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { usePremium } from '@/hooks/usePremium';
import { patternById, type PatternId } from '@/lib/breathing';
import { primeBreathCue } from '@/lib/sound';
import { SLOT_LABEL, doneToday } from '@/lib/ritual';
import { useQuitStore, type SessionSlot } from '@/store/useQuitStore';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';

const SESSION_MS = 90000;

export default function Session() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slot?: string }>();
  const slot: SessionSlot = params.slot === 'morning' || params.slot === 'midday' || params.slot === 'evening' ? params.slot : 'morning';

  const defaultPattern = useQuitStore((s) => s.sessions.defaultPattern);
  const breathSound = useQuitStore((s) => s.breathSound);
  const markSessionDone = useQuitStore((s) => s.markSessionDone);
  const sessionLog = useQuitStore((s) => s.sessionLog);
  const userName = useQuitStore((s) => s.userName);
  const { isPremium } = usePremium();

  const pattern = patternById(defaultPattern as PatternId);
  const [phase, setPhase] = useState<'breathing' | 'done'>('breathing');
  const breath = useBreathPhase(breathSound && isPremium, phase === 'breathing', pattern);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    primeBreathCue();
    track('session_started', { slot, pattern: pattern.id, source: 'home' });
  }, [slot, pattern.id]);

  useEffect(() => {
    if (phase !== 'breathing') return;
    const t = setTimeout(() => {
      haptics.milestone();
      markSessionDone(slot);
      track('session_completed', { slot, pattern: pattern.id });
      setPhase('done');
    }, SESSION_MS);
    return () => clearTimeout(t);
  }, [phase, slot, pattern.id, markSessionDone]);

  const skip = () => {
    track('session_skipped', { slot, pattern: pattern.id });
    router.back();
  };

  const doneCount = doneToday(sessionLog).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F', paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 26 }}>
      <StatusBar style="light" />
      {phase === 'breathing' ? (
        <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' }}>
              {`${SLOT_LABEL[slot]} session · ${pattern.eyebrow}`}
            </Text>
            <BreathingOrb phase={breath.phase} durationMs={breath.durationMs} />
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 26, color: '#EAF4F2', letterSpacing: -0.4 }}>
                {breath.label}
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: '#5BE0C6' }}>{breath.count}</Text>
            </View>
          </View>
          <PressableScale onPress={skip} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#7E9A9B' }}>Not now</Text>
          </PressableScale>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>
              {`${doneCount} of 3 today`}
            </Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 34, color: '#EAF4F2', letterSpacing: -0.4 }}>
              {userName ? `Air claimed, ${userName}.` : 'Air claimed.'}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#9FB4B3' }}>
              {"Ninety seconds that belonged to you, not the vape. See you at the next one."}
            </Text>
          </View>
          <Cta label="Back to clear air →" onPress={() => router.back()} />
        </Animated.View>
      )}
    </View>
  );
}
