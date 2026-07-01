import '../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
} from '@expo-google-fonts/geist-mono';
import { AppProviders } from '@/providers/AppProviders';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore } from '@/store/useQuitStore';
import { AnimatedSplash } from '@/components/splash/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { name } = useTheme();
  return <StatusBar style={name === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });
  const hasHydrated = useQuitStore((s) => s._hasHydrated);
  const ready = fontsLoaded && hasHydrated;
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Hold on the native splash until fonts + persisted state are ready, so the
  // launch redirect reads the real onboardingComplete value (no flash).
  if (!ready) return null;

  return (
    <AppProviders>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        {/* TEMP (Step 2 sanity) — remove with app/debug.tsx */}
        <Stack.Screen name="debug" options={{ presentation: 'modal' }} />
      </Stack>
      {/* Animated brand splash, handed off from the native splash then faded out. */}
      {!splashDone ? <AnimatedSplash onFinish={() => setSplashDone(true)} /> : null}
    </AppProviders>
  );
}
