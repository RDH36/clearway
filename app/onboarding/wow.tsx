import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Presets } from 'react-native-pulsar';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { ClearBurst } from '@/components/onboarding/ClearBurst';
import { Orb } from '@/components/onboarding/Orb';
import { SmokeCompare } from '@/components/home/SmokeCompare';
import { useQuitStore } from '@/store/useQuitStore';
import { useNow } from '@/hooks/useNow';
import { msClean, formatClean } from '@/lib/time';
import { projectedYear } from '@/lib/money';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';

type Stage = 'pre' | 'pulse' | 'counting' | 'reward';

const pad = (n: number) => String(n).padStart(2, '0');

function MoneyCountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 1500);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return (
    <Text style={{ fontFamily: fonts.display, fontSize: 64, lineHeight: 64, color: '#5BE0C6', letterSpacing: -1.5 }}>
      ${value.toLocaleString('en-US')}
    </Text>
  );
}

export default function Wow() {
  const router = useRouter();
  const startQuit = useQuitStore((s) => s.startQuit);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const now = useNow(250);

  const [stage, setStage] = useState<Stage>('pre');
  const [showMoney, setShowMoney] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const orb = useSharedValue(1);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startNow = () => {
    try {
      Presets.System.notificationSuccess();
    } catch (e) {
      console.warn('[pulsar] direct call failed:', e);
    }

    startQuit();
    setStage('pulse');
    orb.value = withSequence(withTiming(1.34, { duration: 220 }), withTiming(0.92, { duration: 300 }), withTiming(1, { duration: 340 }));
    timers.current.push(
      setTimeout(() => setStage('counting'), 750),
      setTimeout(() => setShowMoney(true), 1250),
      setTimeout(() => {
        setStage('reward');
        haptics.milestone();
      }, 3000)
    );
  };

  const openPaywall = useCallback(() => router.push('/onboarding/paywall'), [router]);
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: orb.value }] }));
  const ms = msClean(quit, now);
  const { days } = formatClean(ms);
  const sec = Math.floor(ms / 1000);
  const hms = `${pad(Math.floor(sec / 3600))} : ${pad(Math.floor((sec % 3600) / 60))} : ${pad(sec % 60)}`;
  const showPre = stage === 'pre' || stage === 'pulse';

  return (
    <View style={{ flex: 1 }}>
      <Shell cleared={stage !== 'pre'}>
        <ClearBurst play={stage !== 'pre'} />

        {showPre ? (
          <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <Animated.View style={orbStyle}>
                <Orb size={88} />
              </Animated.View>
              <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 29, lineHeight: 33, color: '#EAF4F2', letterSpacing: -0.4, textAlign: 'center', maxWidth: 280, opacity: stage === 'pulse' ? 0 : 1 }}>
                This is the moment the air starts to clear.
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#AFC4C2', textAlign: 'center', maxWidth: 260, opacity: stage === 'pulse' ? 0 : 1 }}>
                {"The second you tap, your streak begins — and it doesn't stop."}
              </Text>
            </View>
            <View style={{ opacity: stage === 'pulse' ? 0 : 1 }}>
              <Cta label="I'm starting now" onPress={startNow} />
            </View>
          </Animated.View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: fonts.display, fontSize: 144, lineHeight: 132, color: '#EAF4F2', letterSpacing: -4 }}>
                {days}
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: 3, color: '#9FB4B3', textTransform: 'uppercase' }}>days clear · just now</Text>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 48, color: '#5BE0C6', letterSpacing: 1, marginTop: 12 }}>{hms}</Text>
            </View>
            {showMoney ? (
              <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', gap: 14 }}>
                <View style={{ width: 200, height: 1, backgroundColor: '#23383E' }} />
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: fonts.body, fontSize: 16, color: '#9FB4B3' }}>Projected over your first year</Text>
                  <MoneyCountUp target={projectedYear(weekly)} />
                  <Text style={{ fontFamily: fonts.body, fontSize: 16, color: '#9FB4B3' }}>back in your pocket</Text>
                </View>
              </Animated.View>
            ) : null}
          </View>
        )}
      </Shell>
      {stage === 'reward' ? (
        <Animated.View entering={FadeIn.duration(600)} style={StyleSheet.absoluteFill}>
          <SmokeCompare weekly={weekly} onContinue={openPaywall} />
        </Animated.View>
      ) : null}
    </View>
  );
}
