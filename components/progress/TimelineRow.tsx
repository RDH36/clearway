import { useEffect } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LockIcon } from './icons';

export type NodeState = 'reached' | 'current' | 'locked' | 'idle';

const ACC = '#5BE0C6';

function Pulse({ size }: { size: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }), -1, false);
    return () => cancelAnimation(p);
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 0.9 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: ACC },
        style,
      ]}
    />
  );
}

function nodeStyle(state: NodeState, size: number): ViewStyle {
  const base: ViewStyle = { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' };
  if (state === 'reached')
    return { ...base, backgroundColor: ACC, borderWidth: 1.5, borderColor: 'rgba(234,244,242,0.55)', shadowColor: ACC, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 };
  if (state === 'current')
    return { ...base, backgroundColor: 'rgba(91,224,198,0.14)', borderWidth: 2, borderColor: ACC };
  return { ...base, backgroundColor: 'rgba(150,170,172,0.1)', borderWidth: 1.5, borderColor: 'rgba(159,180,179,0.5)' };
}

export function TimelineRow({
  state,
  isLast,
  size = 34,
  children,
}: {
  state: NodeState;
  isLast: boolean;
  size?: number;
  children: React.ReactNode;
}) {
  const lit = state === 'reached';
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {state === 'current' ? <Pulse size={size} /> : null}
          <View style={nodeStyle(state, size)}>
            {state === 'reached' ? (
              <Text style={{ color: '#08221d', fontSize: Math.round(size * 0.44), fontWeight: '700', lineHeight: Math.round(size * 0.44) }}>✓</Text>
            ) : null}
            {state === 'locked' ? <LockIcon size={13} /> : null}
          </View>
        </View>
        <View
          style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            marginVertical: 5,
            opacity: isLast ? 0 : 1,
            backgroundColor: lit ? 'rgba(91,224,198,0.4)' : 'rgba(35,56,62,0.8)',
          }}
        />
      </View>
      <View style={{ flex: 1, marginBottom: 14 }}>{children}</View>
    </View>
  );
}
