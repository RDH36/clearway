import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'pressto';
import { Cta } from '@/components/onboarding/Cta';
import { PlanPicker, type Plan } from '@/components/paywall/PlanPicker';
import { fonts } from '@/constants/theme';

const PERKS = [
  'Daily affirmations built on your reasons',
  'The evolving home-screen widget',
  'Full craving kit — extra patterns + sounds',
  'Every milestone & health marker',
  'Unlimited reasons + daily encouragement',
];

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<Plan>('annual');

  return (
    <View style={{ flex: 1, backgroundColor: '#0B181C' }}>
      <StatusBar style="light" />
      <PressableScale
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 8, right: 22, width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#23383E', backgroundColor: 'rgba(22,40,46,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
      >
        <Text style={{ fontSize: 18, color: '#9FB2B1' }}>×</Text>
      </PressableScale>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 9, paddingTop: 30 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#5BE0C6', textTransform: 'uppercase' }}>
            Clearway premium
          </Text>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 31, color: '#EAF4F2', letterSpacing: -0.4 }}>
            Clear the air, fully.
          </Text>
        </View>

        <View style={{ gap: 9 }}>
          {PERKS.map((perk) => (
            <View key={perk} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 13, color: '#5BE0C6', lineHeight: 16 }}>✦</Text>
              <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#C7D6D4' }}>
                {perk}
              </Text>
            </View>
          ))}
        </View>

        <PlanPicker value={plan} onChange={setPlan} />

        <View style={{ flex: 1 }} />

        <View style={{ gap: 12 }}>
          <Cta label="Continue" onPress={() => router.back()} />
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#7E9A9B', textAlign: 'center' }}>
            Purchases arrive with the next update · Nothing charged today
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
