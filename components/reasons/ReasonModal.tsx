import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import type { Reason } from '@/store/useQuitStore';
import { fonts } from '@/constants/theme';

export type ReasonValues = { glyph: string; title: string; note: string };

const GLYPHS = ['✦', '✚', '♡', '◎', '$', '★'];

const INPUT = {
  backgroundColor: 'rgba(11,24,28,0.6)',
  borderWidth: 1,
  borderColor: '#23383E',
  borderRadius: 13,
  paddingVertical: 12,
  paddingHorizontal: 14,
  fontFamily: fonts.body,
  fontSize: 15,
  color: '#EAF4F2',
} as const;

function ReasonForm({
  initial,
  onSubmit,
  onClose,
}: {
  initial: Reason | null;
  onSubmit: (values: ReasonValues) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useReanimatedKeyboardAnimation();
  const [glyph, setGlyph] = useState(initial?.glyph ?? '✦');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  const [closing, setClosing] = useState(false);
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = closing
      ? withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) })
      : withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [closing, p]);

  const close = () => {
    Keyboard.dismiss();
    setClosing(true);
    setTimeout(onClose, 230);
  };

  const save = () => {
    onSubmit({ glyph, title: title.trim() || 'My reason', note: note.trim() });
    close();
  };

  const kbCompensation = insets.bottom + 24;
  const backdropStyle = useAnimatedStyle(() => ({ opacity: p.value }));
  const sheetStyle = useAnimatedStyle(() => {
    const lift =
      keyboard.height.value < 0 ? Math.min(0, keyboard.height.value + kbCompensation) : 0;
    return { transform: [{ translateY: (1 - p.value) * 620 + lift }] };
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,18,22,0.82)' }]} onPress={close} />
      </Animated.View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: '#152A31',
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: '#3C5E68',
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
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: '#2C474E', alignSelf: 'center' }} />
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 22, color: '#EAF4F2', letterSpacing: -0.3 }}>
            {initial ? 'Edit reason' : 'New reason'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 9 }}>
            {GLYPHS.map((g) => {
              const on = g === glyph;
              return (
                <PressableScale
                  key={g}
                  onPress={() => setGlyph(g)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    borderWidth: 1,
                    borderColor: on ? '#5BE0C6' : '#23383E',
                    backgroundColor: on ? 'rgba(91,224,198,0.14)' : 'rgba(11,24,28,0.6)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: on ? '#5BE0C6' : '#9FB4B3', lineHeight: 22 }}>{g}</Text>
                </PressableScale>
              );
            })}
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title — e.g. For my mornings"
            placeholderTextColor="#5C7375"
            maxLength={40}
            style={INPUT}
          />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Why it matters to you…"
            placeholderTextColor="#5C7375"
            multiline
            maxLength={200}
            style={[INPUT, { minHeight: 84, textAlignVertical: 'top' }]}
          />

          <View style={{ gap: 10 }}>
            <PressableScale
              onPress={save}
              style={{ height: 52, borderRadius: 26, backgroundColor: '#5BE0C6', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#08221D' }}>
                {initial ? 'Save' : 'Add reason'}
              </Text>
            </PressableScale>
            <PressableScale onPress={close} style={{ height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#9FB4B3' }}>Cancel</Text>
            </PressableScale>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

export function ReasonModal({
  visible,
  initial,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  initial: Reason | null;
  onSubmit: (values: ReasonValues) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
      <ReasonForm initial={initial} onSubmit={onSubmit} onClose={onClose} />
    </View>
  );
}
