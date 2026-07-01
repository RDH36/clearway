import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Orb } from '@/components/onboarding/Orb';
import { fonts } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <Shell>
      <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <View style={{ alignItems: 'center', gap: 0 }}>
          <Orb size={74} />
          <Text style={{ fontFamily: fonts.display, fontSize: 46, color: '#EAF4F2', letterSpacing: -1, marginTop: -18 }}>Clearway</Text>
        </View>
        <Text
          style={{ fontFamily: fonts.displaySemibold, fontSize: 30, lineHeight: 34, color: '#EAF4F2', letterSpacing: -0.5, textAlign: 'center', maxWidth: 280 }}
        >
          The air clears from here.
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#AFC4C2', textAlign: 'center', maxWidth: 260 }}>
          Quitting vaping, one cleared breath at a time. No lectures. No shame.
        </Text>
      </Animated.View>
      <Cta label="GET STARTED" onPress={() => router.push('/onboarding/quiz')} />
    </Shell>
  );
}
