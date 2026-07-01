import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Atmosphere } from '@/components/home/Atmosphere';
import { CLARITY_CLEAR, CLARITY_HAZE } from './content';

function TextScrim() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="ob-scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgb(6,16,20)" stopOpacity={0.62} />
            <Stop offset="0.24" stopColor="rgb(6,16,20)" stopOpacity={0.18} />
            <Stop offset="0.44" stopColor="rgb(6,16,20)" stopOpacity={0} />
            <Stop offset="0.52" stopColor="rgb(6,16,20)" stopOpacity={0} />
            <Stop offset="0.74" stopColor="rgb(6,16,20)" stopOpacity={0.34} />
            <Stop offset="1" stopColor="rgb(6,16,20)" stopOpacity={0.74} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ob-scrim)" />
      </Svg>
    </View>
  );
}

export function Backdrop({ cleared = false }: { cleared?: boolean }) {
  const reveal = useSharedValue(cleared ? 1 : 0);

  useEffect(() => {
    reveal.value = withTiming(cleared ? 1 : 0, { duration: 900 });
  }, [cleared, reveal]);

  const clearedStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0E1B1F' }]} pointerEvents="none">
      <Atmosphere msClean={0} clarity={CLARITY_HAZE} smokeHq />
      <Animated.View style={[StyleSheet.absoluteFill, clearedStyle]}>
        <Atmosphere msClean={0} clarity={CLARITY_CLEAR} smoke={false} />
      </Animated.View>
      <TextScrim />
    </View>
  );
}
