import { memo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { fonts } from '@/constants/theme';
import { DAY_MS } from '@/constants/time';
import { moneySaved } from '@/lib/money';
import { Cta } from '@/components/onboarding/Cta';
import { SmokeSplit } from './SmokeSkia';

const { width: W, height: SH } = Dimensions.get('window');
const money$ = (n: number) => '$' + Math.max(0, Math.round(n)).toLocaleString('en-US');

function Readout({ split, weekly }: { split: SharedValue<number>; weekly: number }) {
  const [day, setDay] = useState(45);
  useAnimatedReaction(
    () => Math.round((1 - split.value) * 90),
    (curr, prev) => {
      if (curr !== prev) runOnJS(setDay)(curr);
    }
  );
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 92, lineHeight: 96, color: '#EAF4F2', letterSpacing: -3 }}>{day}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#9FB4B3', textTransform: 'uppercase' }}>days clear</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 32, color: '#5BE0C6', letterSpacing: -1, marginTop: 12 }}>{money$(moneySaved(weekly, day * DAY_MS))}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#9FB4B3' }}>back in your pocket</Text>
    </View>
  );
}

export const SmokeCompare = memo(function SmokeCompare({ weekly, onContinue }: { weekly: number; onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  const split = useSharedValue(0.5);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onChange((e) => {
      'worklet';
      split.value = Math.min(1, Math.max(0, split.value + e.changeX / W));
    });

  const handle = useAnimatedStyle(() => ({ transform: [{ translateX: split.value * W }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <SmokeSplit split={split} />
          <Animated.View style={[{ position: 'absolute', top: 0, height: SH, width: 2, marginLeft: -1, backgroundColor: '#5BE0C6' }, handle]}>
            <View style={{ position: 'absolute', top: SH * 0.56 - 20, left: -20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(11,24,28,0.9)', borderWidth: 2, borderColor: '#5BE0C6', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, color: '#5BE0C6', marginTop: -2 }}>⟷</Text>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 22, left: 0, right: 0, alignItems: 'center', gap: 3, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>Your air, clearing</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#AFC4C2' }}>Drag to compare</Text>
      </View>

      <View pointerEvents="none" style={{ position: 'absolute', top: SH * 0.26, left: 0, right: 0, alignItems: 'center' }}>
        <Readout split={split} weekly={weekly} />
      </View>

      <View style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 24 }}>
        <Cta label="Try your first session →" onPress={onContinue} />
      </View>
    </View>
  );
});
