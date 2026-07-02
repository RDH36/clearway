import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

const TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };

export function Toggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  const { name, colors } = useTheme();
  const p = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    p.value = withTiming(value ? 1 : 0, TIMING);
  }, [value, p]);

  const offTrack = name === 'dark' ? '#2C474E' : colors.haze;
  const onKnob = name === 'dark' ? '#08221D' : colors.surface;

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [offTrack, colors.clear]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * 20 }],
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.muted, onKnob]),
  }));

  return (
    <Pressable onPress={() => onChange(!value)} hitSlop={8}>
      <Animated.View
        style={[{ width: 48, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' }, trackStyle]}
      >
        <Animated.View style={[{ width: 22, height: 22, borderRadius: 11 }, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}
