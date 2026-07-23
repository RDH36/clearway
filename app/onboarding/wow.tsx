import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Presets } from 'react-native-pulsar';
import { PressableScale } from 'pressto';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { ClearBurst } from '@/components/onboarding/ClearBurst';
import { Orb } from '@/components/onboarding/Orb';
import { BreathingOrb } from '@/components/craving/BreathingOrb';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { patternById, type PatternId } from '@/lib/breathing';
import { primeBreathCue } from '@/lib/sound';
import { playAmbient, stopAmbient } from '@/lib/ambient';
import { useQuitStore } from '@/store/useQuitStore';
import { buildSessionPlan } from '@/lib/sessionPlan';
import { track, useOnboardingStepTracked } from '@/lib/analytics';
import { useNow } from '@/hooks/useNow';
import { msClean, formatClean } from '@/lib/time';
import { projectedYear } from '@/lib/money';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';

type Stage = 'pre' | 'pulse' | 'counting' | 'bridge' | 'intro' | 'session' | 'done';

const SESSION_MS = 30000;
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

function Skip({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#7E9A9B' }}>Skip for now</Text>
    </PressableScale>
  );
}

export default function Wow() {
  const router = useRouter();
  useOnboardingStepTracked('wow');
  const startQuit = useQuitStore((s) => s.startQuit);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const userName = useQuitStore((s) => s.userName);
  const withoutIt = useQuitStore((s) => s.withoutIt);
  const worstCravingTime = useQuitStore((s) => s.worstCravingTime);
  const usageFrequency = useQuitStore((s) => s.usageFrequency);
  const quitFeeling = useQuitStore((s) => s.quitFeeling);
  const now = useNow(250);

  const [stage, setStage] = useState<Stage>('pre');
  const [showMoney, setShowMoney] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const orb = useSharedValue(1);

  const pattern = patternById(
    buildSessionPlan({ worstCravingTime, usageFrequency, withoutIt, quitFeeling }).plan.defaultPattern as PatternId
  );
  const breath = useBreathPhase(true, stage === 'session', pattern);

  useEffect(() => {
    primeBreathCue();
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'session') {
      stopAmbient();
      return;
    }
    playAmbient();
    const t = setTimeout(() => {
      haptics.milestone();
      setStage('done');
    }, SESSION_MS);
    return () => {
      clearTimeout(t);
      stopAmbient();
    };
  }, [stage]);

  const startNow = () => {
    try {
      Presets.System.notificationSuccess();
    } catch (e) {
      console.warn('[pulsar] direct call failed:', e);
    }

    startQuit();
    track('quit_started');
    setStage('pulse');
    orb.value = withSequence(withTiming(1.34, { duration: 220 }), withTiming(0.92, { duration: 300 }), withTiming(1, { duration: 340 }));
    timers.current.push(
      setTimeout(() => setStage('counting'), 750),
      setTimeout(() => setShowMoney(true), 1250),
      setTimeout(() => setStage('bridge'), 3800),
      setTimeout(() => setStage('intro'), 6600),
      setTimeout(() => setStage('session'), 9600)
    );
  };

  const toSetup = () => router.push('/onboarding/setup');
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: orb.value }] }));
  const ms = msClean(quit, now);
  const { days } = formatClean(ms);
  const sec = Math.floor(ms / 1000);
  const hms = `${pad(Math.floor(sec / 3600))} : ${pad(Math.floor((sec % 3600) / 60))} : ${pad(sec % 60)}`;
  const showPre = stage === 'pre' || stage === 'pulse';
  const showCounter = stage === 'counting' || stage === 'bridge';

  return (
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
      ) : null}

      {showCounter ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 34 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: fonts.display, fontSize: 144, lineHeight: 132, color: '#EAF4F2', letterSpacing: -4 }}>
              {days}
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: 3, color: '#9FB4B3', textTransform: 'uppercase' }}>days clear · just now</Text>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 48, color: '#5BE0C6', letterSpacing: 1, marginTop: 12 }}>{hms}</Text>
          </View>
          {stage === 'bridge' ? (
            <Animated.Text
              entering={FadeIn.duration(500)}
              style={{ fontFamily: fonts.displaySemibold, fontSize: 20, lineHeight: 27, color: '#EAF4F2', letterSpacing: -0.3, textAlign: 'center', maxWidth: 310 }}
            >
              {"Your counter is running. The urge will come — this is what you'll use when it does."}
            </Animated.Text>
          ) : showMoney ? (
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
      ) : null}

      {stage === 'intro' ? (
        <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>
              Your first session
            </Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 34, color: '#EAF4F2', letterSpacing: -0.4 }}>
              Headphones on if you can.{'\n'}Breathe through your nose — it settles you faster.
            </Text>
          </View>
          <Skip onPress={toSetup} />
        </Animated.View>
      ) : null}

      {stage === 'session' ? (
        <Animated.View entering={FadeIn.duration(600)} style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' }}>
              {pattern.eyebrow}
            </Text>
            <BreathingOrb phase={breath.phase} durationMs={breath.durationMs} />
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 26, color: '#EAF4F2', letterSpacing: -0.4 }}>
                {breath.label}
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: '#5BE0C6' }}>{breath.count}</Text>
            </View>
          </View>
          <Skip onPress={() => setStage('done')} />
        </Animated.View>
      ) : null}

      {stage === 'done' ? (
        <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>
              That feeling
            </Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 34, color: '#EAF4F2', letterSpacing: -0.4 }}>
              {userName ? `That calm, ${userName} — it's yours now.` : "That calm — it's yours now."}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#9FB4B3' }}>
              {"That's the tool. When the urge hits, this is what you reach for — not the vape."}
            </Text>
          </View>
          <Cta label="Set up my ritual →" onPress={toSetup} />
        </Animated.View>
      ) : null}
    </Shell>
  );
}
