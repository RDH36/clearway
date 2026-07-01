import { useEffect } from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function Orb({ size = 80 }: { size?: number }) {
  const d = size * 2;
  const c = size;
  const r = size / 2;

  const breath = useSharedValue(0);
  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [breath]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(breath.value, [0, 1], [1, 1.06]) }],
    opacity: interpolate(breath.value, [0, 1], [0.9, 1]),
  }));

  return (
    <Animated.View style={style}>
      <Svg width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
        <Defs>
          <RadialGradient id="orb-halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.38} />
            <Stop offset="0.5" stopColor="#5BE0C6" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="orb-body" cx="38%" cy="32%" r="72%">
            <Stop offset="0" stopColor="#EAFBF7" />
            <Stop offset="0.22" stopColor="#8FEEDC" />
            <Stop offset="0.5" stopColor="#37CDB1" />
            <Stop offset="0.78" stopColor="#14876F" />
            <Stop offset="1" stopColor="#0A4A40" />
          </RadialGradient>
          <RadialGradient id="orb-spec" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
            <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0.15} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx={c} cy={c} r={size} fill="url(#orb-halo)" />
        <Circle cx={c} cy={c} r={r} fill="url(#orb-body)" />
        <Circle cx={c - r * 0.28} cy={c - r * 0.34} r={r * 0.42} fill="url(#orb-spec)" />
      </Svg>
    </Animated.View>
  );
}
