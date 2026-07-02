import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import type { Reason } from '@/store/useQuitStore';
import { fonts } from '@/constants/theme';

function Burst({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.25, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.6, 1.7]) }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="why-burst" cx="28%" cy="50%" rx="65%" ry="140%">
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#why-burst)" />
      </Svg>
    </Animated.View>
  );
}

function Vapor({ t, left, size }: { t: SharedValue<number>; left: `${number}%`; size: number }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.2, 1], [0, 0.4, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [6, -16]) },
      { scale: interpolate(t.value, [0, 1], [0.9, 1.4]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left, top: '35%', width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(150,170,172,0.45)' },
        style,
      ]}
    />
  );
}

export function WhyCard({ reason, onPress }: { reason: Reason; onPress: () => void }) {
  const [shown, setShown] = useState(reason);
  const fade = useSharedValue(1);
  const burst = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reason.id === shown.id) return;
    burst.value = 0;
    burst.value = withTiming(1, { duration: 900 });
    fade.value = withTiming(0, { duration: 170 });
    timer.current = setTimeout(() => {
      setShown(reason);
      fade.value = withTiming(1, { duration: 280 });
    }, 180);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reason, shown.id, fade, burst]);

  const display = reason.id === shown.id ? reason : shown;
  const label = display.title.trim() || display.note.trim() || 'My reason';

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 5 }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#23383E',
        backgroundColor: 'rgba(22,40,46,0.72)',
        overflow: 'hidden',
      }}
    >
      <Burst t={burst} />
      <Vapor t={burst} left="30%" size={26} />
      <Vapor t={burst} left="58%" size={20} />

      <Animated.View
        style={[
          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
          contentStyle,
        ]}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            backgroundColor: 'rgba(91,224,198,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#5BE0C6', lineHeight: 19 }}>{display.glyph}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' }}>
            My why
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#C7D6D4' }}>
            {label}
          </Text>
        </View>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#23383E',
            backgroundColor: 'rgba(22,40,46,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#9FB4B3', lineHeight: 18 }}>+</Text>
        </View>
      </Animated.View>
    </PressableScale>
  );
}
