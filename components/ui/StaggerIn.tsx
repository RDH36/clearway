import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

export function StaggerIn({
  index = 0,
  base = 60,
  step = 60,
  duration = 380,
  lift = 10,
  play = true,
  style,
  children,
}: {
  index?: number;
  base?: number;
  step?: number;
  duration?: number;
  lift?: number;
  play?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    if (!play) return;
    p.value = withDelay(base + Math.min(index, 10) * step, withTiming(1, { duration }));
  }, [p, play, index, base, step, duration]);
  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * lift }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
