import { useEffect } from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { PressableScale } from 'pressto';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { Easing, FadeOut, LinearTransition, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { fonts } from '@/constants/theme';
import type { QuizOption, QuizQuestion } from './content';

type SV = { value: number };

const PUFFS: { left: DimensionValue; top: DimensionValue; size: number }[] = [
  { left: '24%', top: 0, size: 48 },
  { left: '56%', top: 0, size: 40 },
  { left: '84%', top: 0, size: 34 },
  { left: 0, top: '30%', size: 46 },
  { left: 0, top: '78%', size: 38 },
];

const EMBERS: { left: DimensionValue; top: DimensionValue; dx: number }[] = [
  { left: '32%', top: '62%', dx: -14 },
  { left: '58%', top: '54%', dx: -9 },
  { left: '46%', top: '72%', dx: -20 },
];

function Glow({ t }: { t: SV }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.18, 1], [0, 0.65, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.7, 1.35]) }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: -22, top: -22, right: -22, bottom: -22 }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="34%" cy="42%" r="62%">
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </Animated.View>
  );
}

function SoftPuff({ left, top, size, t }: { left: DimensionValue; top: DimensionValue; size: number; t: SV }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.25, 1], [0, 0.5, 0]),
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, -32]) },
      { translateY: interpolate(t.value, [0, 1], [0, -42]) },
      { scale: interpolate(t.value, [0, 1], [0.5, 2.0]) },
    ],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left, top, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="puff" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="rgb(165,182,184)" stopOpacity={0.5} />
            <Stop offset="1" stopColor="rgb(165,182,184)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#puff)" />
      </Svg>
    </Animated.View>
  );
}

function Ember({ left, top, dx, t }: { left: DimensionValue; top: DimensionValue; dx: number; t: SV }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.1, 0.7], [0, 0.9, 0]),
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, dx]) },
      { translateY: interpolate(t.value, [0, 1], [0, -52]) },
      { scale: interpolate(t.value, [0, 1], [1, 0.4]) },
    ],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left, top, width: 12, height: 12, marginLeft: -6, marginTop: -6 }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="ember" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFD9B0" stopOpacity={0.95} />
            <Stop offset="0.5" stopColor="#FFB57A" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFB57A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#ember)" />
      </Svg>
    </Animated.View>
  );
}

function TapEffect() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 820, easing: Easing.out(Easing.cubic) });
  }, [t]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Glow t={t} />
      {PUFFS.map((p, i) => (
        <SoftPuff key={`p${i}`} {...p} t={t} />
      ))}
      {EMBERS.map((e, i) => (
        <Ember key={`e${i}`} {...e} t={t} />
      ))}
    </View>
  );
}

function Option({ option, selected, dimmed, onPress }: { option: QuizOption; selected: boolean; dimmed: boolean; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
        paddingHorizontal: 20,
        borderRadius: 18,
        borderWidth: 1,
        backgroundColor: selected ? 'rgba(91,224,198,0.24)' : 'rgba(22,40,46,0.72)',
        borderColor: selected ? '#5BE0C6' : '#23383E',
        opacity: dimmed ? 0.35 : 1,
        overflow: 'visible',
      }}
    >
      <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>{option.label}</Text>
      <Text style={{ fontSize: 15, color: '#5BE0C6', opacity: selected ? 1 : 0.32 }}>→</Text>
      {selected ? <TapEffect /> : null}
    </PressableScale>
  );
}

export function QuizCard({
  question,
  selectedLabel,
  onSelect,
}: {
  question: QuizQuestion;
  selectedLabel: string | null;
  onSelect: (option: QuizOption) => void;
}) {
  return (
    <Animated.View layout={LinearTransition.duration(320)} style={{ gap: 10 }}>
      {question.options
        .filter((opt) => selectedLabel == null || opt.label === selectedLabel)
        .map((opt) => (
          <Animated.View key={opt.label} exiting={FadeOut.duration(180)} layout={LinearTransition.duration(320)}>
            <Option
              option={opt}
              selected={selectedLabel === opt.label}
              dimmed={false}
              onPress={() => onSelect(opt)}
            />
          </Animated.View>
        ))}
    </Animated.View>
  );
}
