import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const VAPOR = [
  { left: '20%', delay: 0 },
  { left: '38%', delay: 180 },
  { left: '52%', delay: 60 },
  { left: '66%', delay: 240 },
  { left: '80%', delay: 120 },
  { left: '30%', delay: 320 },
] as const;

function Burst({ t }: { t: { value: number } }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.22, 1], [0, 0.9, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.5, 1.9]) }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="ob-burst" cx="50%" cy="46%" rx="58%" ry="58%">
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ob-burst)" />
      </Svg>
    </Animated.View>
  );
}

function VaporBit({ left, delay, play }: { left: string; delay: number; play: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (play) p.value = withDelay(delay, withTiming(1, { duration: 1700 }));
  }, [play, delay, p]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.18, 1], [0, 0.55, 0]),
    transform: [{ translateY: interpolate(p.value, [0, 1], [0, -150]) }, { scale: interpolate(p.value, [0, 1], [0.9, 1.5]) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: left as `${number}%`,
          top: '52%',
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(150,170,172,0.4)',
        },
        style,
      ]}
    />
  );
}

export function ClearBurst({ play }: { play: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (play) {
      t.value = 0;
      t.value = withTiming(1, { duration: 1100 });
    }
  }, [play, t]);

  if (!play) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Burst t={t} />
      {VAPOR.map((v, i) => (
        <VaporBit key={i} left={v.left} delay={v.delay} play={play} />
      ))}
    </View>
  );
}
