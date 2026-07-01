/**
 * Animated splash — the JS launch screen from the Logo & Splash brief, handed off
 * from the native (static) splash once fonts + state are ready. Smoke drifts over
 * the mark then clears to reveal it ("The air clears from here."), the logo scales
 * in inside two expanding aqua rings, then the whole overlay fades into the app.
 */
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SmokeSkia } from '@/components/home/SmokeSkia';
import { fonts } from '@/constants/theme';
import { SplashBackdrop } from './SplashBackdrop';
import { Spinner } from './Spinner';

const INK = '#EAF4F2';
const MUTED = '#9FB4B3';
const RING = 132;
const ease = Easing.bezier(0.2, 0.7, 0.3, 1);

function Ring({ delay }: { delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) }), -1, false));
  }, [delay, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 1], [0.6, 1.5]) }],
    opacity: interpolate(p.value, [0, 0.3, 1], [0, 0.5, 0]),
  }));
  return <Animated.View style={[styles.ring, style]} />;
}

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.82);
  const content = useSharedValue(0);
  const smoke = useSharedValue(1);
  const overlay = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.02, { duration: 770, easing: ease }),
      withTiming(1, { duration: 630, easing: ease })
    );
    content.value = withTiming(1, { duration: 600, easing: ease });
    smoke.value = withDelay(250, withTiming(0, { duration: 1900, easing: Easing.out(Easing.ease) }));
    overlay.value = withDelay(
      2300,
      withTiming(0, { duration: 520, easing: Easing.in(Easing.ease) }, (done) => {
        if (done) runOnJS(onFinish)();
      })
    );
  }, [content, logoScale, onFinish, overlay, smoke]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const smokeStyle = useAnimatedStyle(() => ({ opacity: smoke.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: content.value, transform: [{ scale: logoScale.value }] }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [{ translateY: interpolate(content.value, [0, 1], [10, 0]) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, overlayStyle]}>
      <SplashBackdrop />

      {/* drifting fog that clears to reveal the mark */}
      <Animated.View style={[StyleSheet.absoluteFill, smokeStyle]} pointerEvents="none">
        <SmokeSkia opacity={0.9} hq />
      </Animated.View>

      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Ring delay={0} />
          <Ring delay={800} />
          <Animated.Image source={require('../../assets/clearway-logo.png')} style={[styles.logo, logoStyle]} />
        </View>

        <Animated.View style={[styles.word, wordStyle]}>
          <Text style={styles.brand}>Clearway</Text>
          <Text style={styles.tagline}>The air clears from here.</Text>
        </Animated.View>
      </View>

      <View style={styles.loader}>
        <Spinner />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#0E1B1F', zIndex: 100 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 26 },
  logoWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: 1, borderColor: 'rgba(91,224,198,0.3)' },
  logo: { width: 120, height: 120, borderRadius: 28 },
  word: { alignItems: 'center', gap: 7 },
  brand: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.5, color: INK },
  tagline: { fontFamily: fonts.body, fontSize: 14, color: MUTED },
  loader: { position: 'absolute', bottom: 72, left: 0, right: 0, alignItems: 'center' },
});
