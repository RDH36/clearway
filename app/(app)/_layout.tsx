import { Redirect, Stack } from 'expo-router';
import { useQuitStore } from '@/store/useQuitStore';

/**
 * Main app stack (spec §4). On launch, if onboarding isn't done we send the user
 * into the funnel. Craving / reset / paywall are presented as modal sheets.
 */
export default function AppLayout() {
  const onboardingComplete = useQuitStore((s) => s.onboardingComplete);
  if (!onboardingComplete) return <Redirect href="/onboarding/welcome" />;

  return (
    <Stack screenOptions={{ headerShown: false, navigationBarTranslucent: true, navigationBarColor: 'transparent' }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="progress"
        options={{
          animation: 'slide_from_right',
          animationDuration: 320,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="reasons"
        options={{
          animation: 'slide_from_right',
          animationDuration: 320,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: '#0E1B1F' },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          animation: 'slide_from_right',
          animationDuration: 320,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="craving"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 320,
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="reset"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          animationDuration: 220,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
