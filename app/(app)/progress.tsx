import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { PressableScale } from 'pressto';
import { useNow } from '@/hooks/useNow';
import { usePremium } from '@/hooks/usePremium';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
import { fonts } from '@/constants/theme';
import { Atmosphere } from '@/components/home/Atmosphere';
import { ProgressTabs, type ProgressTab } from '@/components/progress/ProgressTabs';
import { MilestonesTab } from '@/components/progress/MilestonesTab';
import { RecoveryTab } from '@/components/progress/RecoveryTab';
import { BackIcon } from '@/components/progress/icons';

const BTN = {
  width: 44,
  height: 44,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: '#23383E',
  backgroundColor: 'rgba(22,40,46,0.5)',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

function Scrim() {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="progress-scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#061014" stopOpacity={0.66} />
            <Stop offset="0.22" stopColor="#061014" stopOpacity={0.2} />
            <Stop offset="0.42" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.6" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.82" stopColor="#061014" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#061014" stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#progress-scrim)" />
      </Svg>
    </View>
  );
}

export default function Progress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow(60000);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const { isPremium } = usePremium();
  const ms = msClean(quit, now);
  const [tab, setTab] = useState<ProgressTab>('milestones');
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F' }}>
      <StatusBar style="light" />
      <Atmosphere key={quit ?? 0} msClean={ms} smoke={false} />
      <Scrim />

      <View
        style={{
          flex: 1,
          zIndex: 3,
          paddingHorizontal: 24,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <PressableScale onPress={() => router.back()} style={BTN}>
            <BackIcon />
          </PressableScale>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, color: '#EAF4F2', letterSpacing: -0.4 }}>
            Progress
          </Text>
        </View>

        <View style={{ marginBottom: 18 }}>
          <ProgressTabs value={tab} onChange={setTab} />
        </View>

        <View style={{ flex: 1, display: tab === 'milestones' ? 'flex' : 'none' }}>
          <MilestonesTab
            ms={ms}
            quit={quit ?? 0}
            visible={tab === 'milestones'}
            isPremium={isPremium}
            onLockedPress={() => router.push('/paywall')}
          />
        </View>
        {warm || tab === 'recovery' ? (
          <View style={{ flex: 1, display: tab === 'recovery' ? 'flex' : 'none' }}>
            <RecoveryTab
              ms={ms}
              visible={tab === 'recovery'}
              isPremium={isPremium}
              onLockedPress={() => router.push('/paywall')}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
