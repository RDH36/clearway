import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Highlight } from '@/components/ui/Highlight';
import { buildEmpathy, EMPATHY_PROGRESS } from '@/components/onboarding/content';
import { useQuitStore } from '@/store/useQuitStore';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';

function Spinner() {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
  }, [spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View
      style={[
        { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#23383E', borderTopColor: '#5BE0C6' },
        style,
      ]}
    />
  );
}

export default function Empathy() {
  const router = useRouter();
  const vapingDuration = useQuitStore((s) => s.vapingDuration);
  const worstCravingTime = useQuitStore((s) => s.worstCravingTime);
  const quitFeeling = useQuitStore((s) => s.quitFeeling);
  const [revealed, setRevealed] = useState(false);
  const { mirror, feeling, proof } = buildEmpathy(vapingDuration, worstCravingTime, quitFeeling);

  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed(true);
      haptics.milestone();
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  if (!revealed) {
    return (
      <Shell progress={EMPATHY_PROGRESS}>
        <Animated.View entering={FadeIn} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <Spinner />
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: '#9FB2B1' }}>Reading your answers…</Text>
        </Animated.View>
      </Shell>
    );
  }

  return (
    <Shell progress={EMPATHY_PROGRESS}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 22 }}>
        <Animated.Text
          entering={FadeInDown.duration(600)}
          style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}
        >
          {"Here's what we heard"}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(250).duration(700)}
          style={{ fontFamily: fonts.displaySemibold, fontSize: 28, lineHeight: 34, color: '#EAF4F2', letterSpacing: -0.4 }}
        >
          {mirror}
        </Animated.Text>
        {feeling ? (
          <Animated.View entering={FadeInDown.delay(850).duration(700)}>
            <Highlight
              text={feeling}
              style={{ fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 25, color: '#C7D6D4' }}
            />
          </Animated.View>
        ) : null}
        <Animated.View entering={FadeInDown.delay(feeling ? 1450 : 850).duration(700)}>
          <Highlight
            text={proof}
            style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: '#9FB2B1' }}
          />
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(feeling ? 2100 : 1500).duration(700)}>
        <Cta label="See my plan →" onPress={() => router.replace('/onboarding/solution')} />
      </Animated.View>
    </Shell>
  );
}
