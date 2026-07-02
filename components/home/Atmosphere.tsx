import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { clarity, getAtmosphere } from '@/lib/atmosphere';
import { SmokeSkia } from './SmokeSkia';

function SmokeFade({ opacity, hq }: { opacity: number; hq: boolean }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withTiming(1, { duration: 450 });
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <SmokeSkia opacity={opacity} hq={hq} />
    </Animated.View>
  );
}

function AtmosphereBase({
  msClean,
  clarity: clarityOverride,
  smoke = true,
  smokeHq = false,
  active = true,
}: {
  msClean: number;
  clarity?: number;
  smoke?: boolean;
  smokeHq?: boolean;
  active?: boolean;
}) {
  const a = getAtmosphere(msClean, 1, clarityOverride);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={a.depth.top} />
            <Stop offset="0.5" stopColor={a.depth.mid} />
            <Stop offset="1" stopColor={a.depth.bot} />
          </LinearGradient>
          <RadialGradient id="aqua" cx="50%" cy="2%" rx="125%" ry={`${a.aqua.ry}%`}>
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.95} />
            <Stop offset="0.55" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="horizon" cx="50%" cy="103%" rx="140%" ry={`${a.horizon.ry}%`}>
            <Stop offset="0" stopColor="rgb(255,186,128)" stopOpacity={1} />
            <Stop offset="0.32" stopColor="rgb(255,170,150)" stopOpacity={0.5} />
            <Stop offset="0.62" stopColor="rgb(255,179,120)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#depth)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#aqua)" opacity={a.aqua.opacity} />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#horizon)" opacity={a.horizon.opacity} />
      </Svg>

      {smoke && active ? <SmokeFade opacity={a.fog.opacity} hq={smokeHq} /> : null}

      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="hazeSheet" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgb(150,170,172)" stopOpacity={0.5} />
            <Stop offset="0.45" stopColor="rgb(140,162,164)" stopOpacity={0.62} />
            <Stop offset="1" stopColor="rgb(150,170,172)" stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#hazeSheet)" opacity={a.hazeSheet.opacity} />
      </Svg>
    </View>
  );
}

const effClarity = (p: { msClean: number; clarity?: number }) => p.clarity ?? clarity(p.msClean);

export const Atmosphere = memo(
  AtmosphereBase,
  (prev, next) =>
    Math.round(effClarity(prev) * 1000) === Math.round(effClarity(next) * 1000) &&
    prev.active === next.active &&
    prev.smoke === next.smoke
);
