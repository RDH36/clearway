/**
 * B4 — Craving tool ("I need a moment"). A calm modal sheet: the 4-7-8 breathing
 * orb breathes live (Step 2 logic), the guiding label + countdown sync to each
 * phase, and the premium craving kit sits locked below. Atmosphere screen →
 * dark styling always, light status bar (same rule as Home).
 *
 * Transitions: content settles in with a gentle staggered fade on open, and the
 * guiding word cross-fades softly on every phase change (never a hard swap).
 * A scrim (design textScrim) darkens the fog behind the content — it strengthens
 * with the haze so the locked cards stay legible even at full smoke.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { useNow } from '@/hooks/useNow';
import { useAfterTransition } from '@/hooks/useAfterTransition';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { usePremium } from '@/hooks/usePremium';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
import { track } from '@/lib/analytics';
import { clarity } from '@/lib/atmosphere';
import { primeBreathCue } from '@/lib/sound';
import { playAmbient, stopAmbient } from '@/lib/ambient';
import { patternById, type PatternId } from '@/lib/breathing';
import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { formatMoney } from '@/lib/format';
import { moneySaved } from '@/lib/money';
import { DAY_MS, HOUR_MS } from '@/constants/time';
import { fonts } from '@/constants/theme';
import { Atmosphere } from '@/components/home/Atmosphere';
import { BreathingOrb } from '@/components/craving/BreathingOrb';
import { CraveKit } from '@/components/craving/CraveKit';
import { SoundToggle } from '@/components/craving/SoundToggle';

function Scrim({ intensity }: { intensity: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2, opacity: intensity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="crave-scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#061014" stopOpacity={0.66} />
            <Stop offset="0.22" stopColor="#061014" stopOpacity={0.2} />
            <Stop offset="0.42" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.54" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.76" stopColor="#061014" stopOpacity={0.34} />
            <Stop offset="1" stopColor="#061014" stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#crave-scrim)" />
      </Svg>
    </View>
  );
}

export default function Craving() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow(250);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const breathSound = useQuitStore((s) => s.breathSound);
  const setBreathSound = useQuitStore((s) => s.setBreathSound);
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const firstReason = useQuitStore((s) => s.reasons[0]?.title);
  const userName = useQuitStore((s) => s.userName);
  const { isPremium } = usePremium();
  const ms = msClean(quit, now);
  const smokeOn = useAfterTransition();
  const [patternId, setPatternId] = useState<PatternId>('calm478');
  const pattern = patternById(patternId);
  const soundOn = breathSound && isPremium;
  const breath = useBreathPhase(soundOn, true, pattern);

  useEffect(() => {
    if (smokeOn && soundOn) playAmbient();
    else stopAmbient();
    return () => stopAmbient();
  }, [smokeOn, soundOn]);

  const affirmation = isPremium
    ? pickAffirmation({
        motivation,
        moment: 'craving',
        seed: Math.floor(ms / HOUR_MS),
        reason: reasonLabel(firstReason, motivation),
        days: Math.max(1, Math.floor(ms / DAY_MS)),
        money: formatMoney(moneySaved(weekly, ms)),
        name: userName,
      })
    : null;

  useEffect(() => {
    primeBreathCue();
    track('craving_opened');
  }, []);

  // Heavier haze → stronger scrim + darker cards, so they keep contrast when the air is thick.
  const haze = 1 - clarity(ms);
  const scrim = Math.min(1, 0.5 + haze * 0.5);

  const labelOp = useSharedValue(1);
  useEffect(() => {
    labelOp.value = 0;
    labelOp.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
  }, [breath.label, labelOp]);
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOp.value,
    transform: [{ translateY: (1 - labelOp.value) * 6 }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F' }}>
      <StatusBar style="light" />
      <Atmosphere key={quit ?? 0} msClean={ms} active={smokeOn} />
      <Scrim intensity={scrim} />

      <View
        style={{
          flex: 1,
          zIndex: 3,
          paddingHorizontal: 26,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }} />
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 24, color: '#EAF4F2', letterSpacing: -0.3 }}>
              Ride it out
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end', transform: [{ translateY: 10 }] }}>
              <SoundToggle
                value={breathSound && isPremium}
                onChange={(v) => (isPremium ? setBreathSound(v) : router.push('/paywall'))}
              />
            </View>
          </View>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase', textAlign: 'center' }}>
            {pattern.eyebrow}
          </Text>
        </View>

        <View
          style={{ alignItems: 'center', justifyContent: 'center', gap: 22, paddingVertical: 20 }}
        >
          <BreathingOrb phase={breath.phase} durationMs={breath.durationMs} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Animated.Text style={[{ fontFamily: fonts.displaySemibold, fontSize: 26, color: '#EAF4F2' }, labelStyle]}>
              {breath.label}
            </Animated.Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: '#5BE0C6' }}>{breath.count}</Text>
            {affirmation ? (
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 19,
                  color: '#9FB4B3',
                  textAlign: 'center',
                  maxWidth: 280,
                  paddingTop: 4,
                }}
              >
                {affirmation.text}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <CraveKit
            haze={haze}
            isPremium={isPremium}
            activeId={patternId}
            onSelect={(p) => setPatternId(p.id)}
            onLockedPress={() => router.push('/paywall')}
          />
        </View>

        <View>
          <PressableScale
            onPress={() => router.back()}
            style={{
              height: 52,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: '#23383E',
              backgroundColor: 'rgba(22,40,46,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#EAF4F2' }}>{"I'm okay now"}</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
