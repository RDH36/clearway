import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PressableScale } from 'pressto';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
import { haptics } from '@/lib/haptics';
import { track } from '@/lib/analytics';
import { DAY_MS } from '@/constants/time';
import { fonts } from '@/constants/theme';

function GlowOrb() {
  return (
    <Svg width={60} height={60}>
      <Defs>
        <RadialGradient id="reset-orb" cx="50%" cy="38%" rx="55%" ry="55%">
          <Stop offset="0" stopColor="#EAF4F2" stopOpacity={0.5} />
          <Stop offset="0.5" stopColor="#5BE0C6" stopOpacity={0.32} />
          <Stop offset="0.8" stopColor="#5BE0C6" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={30} cy={30} r={30} fill="url(#reset-orb)" />
    </Svg>
  );
}

function TrophyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#5BE0C6" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 4h10v6a5 5 0 0 1-10 0z" />
      <Path d="M12 15v4" />
      <Path d="M8 21h8" />
    </Svg>
  );
}

export default function Reset() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const quit = useQuitStore((s) => s.quitTimestamp);
  const longestStreakMs = useQuitStore((s) => s.longestStreakMs);
  const slip = useQuitStore((s) => s.slip);

  const ms = msClean(quit);
  const longestDays = Math.floor(Math.max(longestStreakMs, ms) / DAY_MS);

  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, [p]);
  const sheetAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - p.value) * 520 }],
  }));

  const confirm = () => {
    haptics.resetConfirm();
    slip();
    track('slip_recorded');
    router.back();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()}>
        <Svg width="100%" height="100%" pointerEvents="none">
          <Defs>
            <RadialGradient id="reset-veil" cx="50%" cy="0%" rx="120%" ry="80%">
              <Stop offset="0" stopColor="#081216" stopOpacity={0.7} />
              <Stop offset="1" stopColor="#081216" stopOpacity={0.92} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#reset-veil)" />
        </Svg>
      </Pressable>

      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View style={sheetAnim}>
          <View
            style={{
              backgroundColor: '#152A31',
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: '#3C5E68',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingTop: 14,
              paddingHorizontal: 26,
              paddingBottom: insets.bottom + 30,
              alignItems: 'center',
              gap: 18,
            }}
          >
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: '#2C474E' }} />
          <GlowOrb />

          <View style={{ alignItems: 'center', gap: 9 }}>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, color: '#EAF4F2', letterSpacing: -0.4 }}>
              Slips happen.
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#C7D6D4', maxWidth: 280, textAlign: 'center' }}>
              {"One slip doesn't erase the work you've done. This isn't starting over — it's just starting from now."}
            </Text>
          </View>

          <View
            style={{
              alignSelf: 'stretch',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
              paddingVertical: 15,
              paddingHorizontal: 17,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: 'rgba(91,224,198,0.22)',
              backgroundColor: 'rgba(91,224,198,0.08)',
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(91,224,198,0.14)', alignItems: 'center', justifyContent: 'center' }}>
              <TrophyIcon />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#EAF4F2' }}>
                {`Longest streak — ${longestDays} day${longestDays === 1 ? '' : 's'}`}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#9FB4B3' }}>
                Kept on your record, always.
              </Text>
            </View>
          </View>

          <View style={{ alignSelf: 'stretch', gap: 11 }}>
            <PressableScale
              onPress={confirm}
              style={{ height: 54, borderRadius: 27, backgroundColor: '#5BE0C6', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#08221D' }}>Start fresh from now</Text>
            </PressableScale>
            <PressableScale
              onPress={() => router.back()}
              style={{ height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#2C474E', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#C7D6D4' }}>{"Never mind — I'm okay"}</Text>
            </PressableScale>
          </View>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}
