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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="milestones" />
      <Stack.Screen name="health" />
      <Stack.Screen name="reasons" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="craving"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 750,
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen name="reset" options={{ presentation: 'modal' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
