/** Aqua top-arc spinner — shared by the animated splash and the paywall→home loader. */
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function Spinner({ size = 34 }: { size?: number }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false);
  }, [spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: 2 }, styles.ring, style]}
    />
  );
}

const styles = StyleSheet.create({
  ring: { borderColor: 'rgba(35,56,62,0.8)', borderTopColor: '#5BE0C6' },
});
