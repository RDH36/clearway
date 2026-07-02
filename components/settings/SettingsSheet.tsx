import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from './SettingsGroup';

export type RequestClose = (after?: () => void) => void;

export function SettingsSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: (requestClose: RequestClose) => ReactNode;
}) {
  const { name, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [closing, setClosing] = useState(false);

  const p = useSharedValue(0);
  useEffect(() => {
    p.value = closing
      ? withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) })
      : withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [closing, p]);

  const requestClose: RequestClose = (after) => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      after?.();
    }, 230);
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: p.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - p.value) * 620 }] }));

  const dark = name === 'dark';
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(8,18,22,0.82)' : 'rgba(14,27,31,0.45)' }]}
          onPress={() => requestClose()}
        />
      </Animated.View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: dark ? '#152A31' : colors.surface,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: dark ? '#3C5E68' : colors.line,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingTop: 14,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              gap: 16,
            },
            sheetStyle,
          ]}
        >
          <View
            style={{
              width: 38,
              height: 5,
              borderRadius: 3,
              backgroundColor: dark ? '#2C474E' : colors.haze,
              alignSelf: 'center',
            }}
          />
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 22, color: colors.ink, letterSpacing: -0.3 }}>
            {title}
          </Text>
          {children(requestClose)}
        </Animated.View>
      </View>
    </View>
  );
}

export function SheetButton({
  label,
  onPress,
  variant = 'primary',
  danger,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  danger?: boolean;
}) {
  const { colors } = useTheme();
  if (variant === 'ghost') {
    return (
      <PressableScale onPress={onPress} style={{ height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.muted }}>{label}</Text>
      </PressableScale>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      style={{
        height: 52,
        borderRadius: 26,
        backgroundColor: danger ? colors.warn : colors.clear,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: danger ? '#2A130B' : '#08221D' }}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function Stepper({
  label,
  value,
  onPrev,
  onNext,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { name, colors } = useTheme();
  const btn = {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: name === 'dark' ? 'rgba(11,24,28,0.6)' : withAlpha(colors.haze, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.muted, width: 58 }}>{label}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressableScale onPress={onPrev} style={btn}>
          <Text style={{ fontSize: 19, lineHeight: 21, color: colors.muted }}>‹</Text>
        </PressableScale>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 17, color: colors.ink }}>{value}</Text>
        <PressableScale onPress={onNext} style={btn}>
          <Text style={{ fontSize: 19, lineHeight: 21, color: colors.muted }}>›</Text>
        </PressableScale>
      </View>
    </View>
  );
}
