import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BREATH_PHASES, type BreathPhase } from '@/lib/breathing';

const FIELD = 208;
const BODY = 150;
const CANVAS = BODY * 2;
const C = BODY;
const R = BODY / 2;
const MIN_SCALE = 0.6;

const [INHALE, , EXHALE] = BREATH_PHASES;

/**
 * The signature craving orb — the same glowing 3D sphere as the WOW orb. It
 * follows the breath phases from the shared clock: it grows to full over the
 * inhale, settles/holds at full, then contracts over the exhale. Driven off the
 * `phase` prop so it stays locked to the guiding label (no independent drift).
 */
export function BreathingOrb({ phase }: { phase: BreathPhase }) {
  const scale = useSharedValue(MIN_SCALE);

  useEffect(() => {
    if (phase === 'inhale') {
      scale.value = withTiming(1, { duration: INHALE.durationMs, easing: Easing.inOut(Easing.ease) });
    } else if (phase === 'exhale') {
      scale.value = withTiming(MIN_SCALE, { duration: EXHALE.durationMs, easing: Easing.inOut(Easing.ease) });
    } else {
      scale.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
    }
  }, [phase, scale]);

  const sphere = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.field}>
      <View style={styles.ring} pointerEvents="none" />
      <Animated.View style={sphere}>
        <Svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
          <Defs>
            <RadialGradient id="cro-halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.34} />
              <Stop offset="0.5" stopColor="#5BE0C6" stopOpacity={0.1} />
              <Stop offset="1" stopColor="#5BE0C6" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="cro-body" cx="38%" cy="32%" r="72%">
              <Stop offset="0" stopColor="#EAFBF7" />
              <Stop offset="0.22" stopColor="#8FEEDC" />
              <Stop offset="0.5" stopColor="#37CDB1" />
              <Stop offset="0.78" stopColor="#14876F" />
              <Stop offset="1" stopColor="#0A4A40" />
            </RadialGradient>
            <RadialGradient id="cro-spec" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
              <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0.15} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={C} cy={C} r={BODY} fill="url(#cro-halo)" />
          <Circle cx={C} cy={C} r={R} fill="url(#cro-body)" />
          <Circle cx={C - R * 0.28} cy={C - R * 0.34} r={R * 0.42} fill="url(#cro-spec)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: FIELD, height: FIELD, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(91,224,198,0.16)',
  },
});
