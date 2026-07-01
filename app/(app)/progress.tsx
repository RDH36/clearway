import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { PressableScale } from 'pressto';
import { useNow } from '@/hooks/useNow';
import { useAfterTransition } from '@/hooks/useAfterTransition';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
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
  const now = useNow(1000);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const ms = msClean(quit, now);
  const smokeOn = useAfterTransition();
  const [tab, setTab] = useState<ProgressTab>('milestones');

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F' }}>
      <StatusBar style="light" />
      <Atmosphere key={quit ?? 0} msClean={ms} active={smokeOn} />
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <PressableScale onPress={() => router.back()} style={BTN}>
            <BackIcon />
          </PressableScale>
          <View style={{ flex: 1 }}>
            <ProgressTabs value={tab} onChange={setTab} />
          </View>
        </View>

        {tab === 'milestones' ? <MilestonesTab ms={ms} quit={quit ?? 0} /> : <RecoveryTab ms={ms} />}
      </View>
    </View>
  );
}
