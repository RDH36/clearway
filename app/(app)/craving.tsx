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
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { useNow } from '@/hooks/useNow';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
import { clarity } from '@/lib/atmosphere';
import { primeBreathCue } from '@/lib/sound';
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
  const ms = msClean(quit, now);
  const breath = useBreathPhase(breathSound);

  useEffect(() => {
    primeBreathCue();
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
      <Atmosphere key={quit ?? 0} msClean={ms} />
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
        <Animated.View entering={FadeInDown.duration(520).delay(80)} style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }} />
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 24, color: '#EAF4F2', letterSpacing: -0.3 }}>
              Ride it out
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end', transform: [{ translateY: 10 }] }}>
              <SoundToggle value={breathSound} onChange={setBreathSound} />
            </View>
          </View>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase', textAlign: 'center' }}>
            4 · 7 · 8 breathing
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(760).delay(180)}
          style={{ alignItems: 'center', justifyContent: 'center', gap: 22, paddingVertical: 20 }}
        >
          <BreathingOrb phase={breath.phase} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Animated.Text style={[{ fontFamily: fonts.displaySemibold, fontSize: 26, color: '#EAF4F2' }, labelStyle]}>
              {breath.label}
            </Animated.Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: '#5BE0C6' }}>{breath.count}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(520).delay(320)} style={{ flex: 1 }}>
          <CraveKit haze={haze} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(520).delay(420)}>
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
        </Animated.View>
      </View>
    </View>
  );
}
