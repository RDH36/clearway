/**
 * Transition loader — the branded, smoke-styled hand-off shown when leaving the
 * onboarding paywall for the home screen. Same atmosphere as the splash: the fog
 * thins as it "clears the air" while a spinner runs, then it calls onDone.
 *
 * The root is opaque #0E1B1F from frame 1 (no opacity animation) so the modal's
 * white background never bleeds through; only the smoke + content fade.
 */
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SmokeSkia } from '@/components/home/SmokeSkia';
import { fonts } from '@/constants/theme';
import { SplashBackdrop } from './SplashBackdrop';
import { Spinner } from './Spinner';

const ease = Easing.bezier(0.2, 0.7, 0.3, 1);

export function TransitionLoader({
  onDone,
  duration = 1600,
  label = 'Clearing the air…',
}: {
  onDone: () => void;
  duration?: number;
  label?: string;
}) {
  const enter = useSharedValue(0);
  const smoke = useSharedValue(0.92);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 320, easing: ease });
    smoke.value = withTiming(0.34, { duration: duration - 200, easing: Easing.out(Easing.ease) });
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [duration, enter, onDone, smoke]);

  const smokeStyle = useAnimatedStyle(() => ({ opacity: smoke.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: enter.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root]}>
      <SplashBackdrop />
      <Animated.View style={[StyleSheet.absoluteFill, smokeStyle]} pointerEvents="none">
        <SmokeSkia opacity={0.9} hq />
      </Animated.View>
      <Animated.View style={[styles.center, contentStyle]}>
        <Spinner />
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#0E1B1F', zIndex: 100 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 20 },
  label: { fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3', letterSpacing: 0.2 },
});
