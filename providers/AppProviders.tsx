/**
 * Premium foundation, wired once at the root (spec §0b, build order step 1):
 *  - GestureHandlerRootView — required peer for pressto + reanimated gestures.
 *  - KeyboardProvider (keyboard-controller) — frame-perfect keyboard for inputs.
 *  - SafeAreaProvider — insets for every screen.
 *  - PressablesConfig (pressto) — spring press-state on EVERY pressable, with a
 *    pulsar selection tick fired from the global onPress handler so every tap feels.
 *  - ThemeProvider — dark-primary token system.
 */
import { type ReactNode, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import { PressablesConfig } from 'pressto';
import { haptics, initHaptics } from '@/lib/haptics';
import { initPurchases } from '@/lib/purchases';
import { posthog } from '@/lib/analytics';
import { PremiumSync } from '@/components/premium/PremiumSync';
import { ThemeProvider } from '@/theme/ThemeProvider';

function ScreenTracker() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current === pathname) return;
    posthog.screen(pathname, { previous_screen: previous.current });
    previous.current = pathname;
  }, [pathname]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initHaptics();
    initPurchases();
  }, []);

  return (
    <PostHogProvider client={posthog} autocapture={false}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <PressablesConfig
              animationType="spring"
              animationConfig={{ damping: 30, stiffness: 200 }}
              config={{ minScale: 0.95, activeOpacity: 0.9, baseScale: 1 }}
              globalHandlers={{ onPress: () => haptics.tap() }}
            >
              <ThemeProvider>
                <PremiumSync />
                <ScreenTracker />
                {children}
              </ThemeProvider>
            </PressablesConfig>
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}
