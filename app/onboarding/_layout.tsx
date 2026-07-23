import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useQuitStore } from '@/store/useQuitStore';

export default function OnboardingLayout() {
  const onboardingComplete = useQuitStore((s) => s.onboardingComplete);
  if (onboardingComplete) return <Redirect href="/" />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'none',
          navigationBarTranslucent: true,
          navigationBarColor: 'transparent',
          contentStyle: { backgroundColor: '#0B181C' },
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="quiz" />
        <Stack.Screen name="empathy" />
        <Stack.Screen name="solution" />
        <Stack.Screen name="reasons" />
        <Stack.Screen name="wow" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
