/**
 * Premium foundation, wired once at the root (spec §0b, build order step 1):
 *  - GestureHandlerRootView — required peer for pressto + reanimated gestures.
 *  - KeyboardProvider (keyboard-controller) — frame-perfect keyboard for inputs.
 *  - SafeAreaProvider — insets for every screen.
 *  - PressablesConfig (pressto) — spring press-state on EVERY pressable, with a
 *    pulsar selection tick fired from the global onPress handler so every tap feels.
 *  - ThemeProvider — dark-primary token system.
 */
import { type ReactNode, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PressablesConfig } from 'pressto';
import { haptics, initHaptics } from '@/lib/haptics';
import { initPurchases } from '@/lib/purchases';
import { ThemeProvider } from '@/theme/ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initHaptics();
    initPurchases();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <PressablesConfig
            animationType="spring"
            animationConfig={{ damping: 30, stiffness: 200 }}
            config={{ minScale: 0.95, activeOpacity: 0.9, baseScale: 1 }}
            globalHandlers={{ onPress: () => haptics.tap() }}
          >
            <ThemeProvider>{children}</ThemeProvider>
          </PressablesConfig>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
