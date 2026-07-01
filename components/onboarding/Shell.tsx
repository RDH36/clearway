import { type ReactNode, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Backdrop } from './Backdrop';

const SCREEN_W = Dimensions.get('window').width;

function ProgressBar({ progress }: { progress: number }) {
  const w = useSharedValue(progress);
  useEffect(() => {
    w.value = withTiming(progress, { duration: 550 });
  }, [progress, w]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, w.value)) * 100}%` }));

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      style={{ height: 6, borderRadius: 3, backgroundColor: '#1c3137', overflow: 'hidden', marginBottom: 22 }}
    >
      <Animated.View
        style={[
          { height: '100%', borderRadius: 3, backgroundColor: '#5BE0C6', shadowColor: '#5BE0C6', shadowOpacity: 0.5, shadowRadius: 6 },
          fill,
        ]}
      />
    </Animated.View>
  );
}

function SlideIn({ children }: { children: ReactNode }) {
  const x = useSharedValue(SCREEN_W);
  useEffect(() => {
    x.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
}

type Props = {
  children: ReactNode;
  progress?: number;
  cleared?: boolean;
};

export function Shell({ children, progress, cleared }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <Backdrop cleared={cleared} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {progress != null ? <ProgressBar progress={progress} /> : null}
        <SlideIn>{children}</SlideIn>
      </View>
    </View>
  );
}
