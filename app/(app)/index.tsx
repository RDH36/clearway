/**
 * B1 — Home (hero). The locked 1b design, wired live to the store: the counter,
 * money, milestone ring and clearing atmosphere all derive from quitTimestamp
 * (Step 2 logic) every tick. Overlay actions route to placeholders for now.
 */
import { Text, View, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'pressto';
import { useNow } from '@/hooks/useNow';
import { useScreenFocused } from '@/hooks/useScreenFocused';
import { useQuitStore } from '@/store/useQuitStore';
import { msClean } from '@/lib/time';
import { moneySaved } from '@/lib/money';
import { clarity } from '@/lib/atmosphere';
import { formatMoney } from '@/lib/format';
import { darkColors, fonts } from '@/constants/theme';
import { Atmosphere } from '@/components/home/Atmosphere';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroCounter } from '@/components/home/HeroCounter';
import { StatsRow } from '@/components/home/StatsRow';
import { OrbIcon, SlipIcon } from '@/components/home/icons';
import { DAY_MS } from '@/constants/time';

function statusFor(ms: number): string {
  const days = ms / DAY_MS;
  if (days < 1) return "The air's thick today. Day one is the bravest one.";
  if (days >= 30) return 'Clear air. You earned every breath of it.';
  return 'The haze is lifting. Keep breathing easy.';
}

const MOMENT: ViewStyle = {
  height: 56,
  borderRadius: 28,
  borderWidth: 1,
  borderColor: 'rgba(91,224,198,0.5)',
  backgroundColor: 'rgba(91,224,198,0.10)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow(250);
  const focused = useScreenFocused();

  const quit = useQuitStore((s) => s.quitTimestamp);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const ms = msClean(quit, now);

  // Capped at 99% — the haze never fully clears (a wisp always remains), so the
  // reading stays honest and keeps a little "more to clear" motivation.
  const cleared = Math.min(99, Math.round(clarity(ms) * 100));

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F' }}>
      {/* Home's surface is dark at every streak level, so the bar is always light
          here regardless of app theme (themed screens keep the global theme-driven bar). */}
      <StatusBar style="light" />
      {/* Keyed on quitTimestamp so a reset remounts a fresh smoke canvas — it
          immediately returns to full haze and keeps drifting (no stale/frozen shader). */}
      <Atmosphere key={quit ?? 0} msClean={ms} active={focused} />

      <View
        style={{
          flex: 1,
          zIndex: 3,
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <HomeHeader
          onSettings={() => router.push('/settings')}
          onProgress={() => router.push('/progress')}
        />

        <HeroCounter msClean={ms} statusCopy={statusFor(ms)} />

        <View style={{ gap: 12 }}>
          <StatsRow
            money={formatMoney(moneySaved(weekly, ms))}
            clearedPct={cleared}
            onProgress={() => router.push('/progress')}
          />

          <PressableScale style={MOMENT} onPress={() => router.push('/craving')}>
            <OrbIcon />
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#5BE0C6' }}>I need a moment</Text>
          </PressableScale>

          <PressableScale
            style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4, paddingHorizontal: 10 }}
            onPress={() => router.push('/reset')}
          >
            <SlipIcon color={darkColors.warn} />
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: darkColors.warn }}>I slipped</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
