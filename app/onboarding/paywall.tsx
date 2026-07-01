import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'pressto';
import { useQuitStore } from '@/store/useQuitStore';
import { useNow } from '@/hooks/useNow';
import { msClean } from '@/lib/time';
import { Cta } from '@/components/onboarding/Cta';
import { fonts } from '@/constants/theme';

type Plan = 'annual' | 'monthly' | 'lifetime';

const pad = (n: number) => String(n).padStart(2, '0');

function Radio({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: on ? 6 : 2,
        borderColor: on ? '#5BE0C6' : '#3A5258',
        backgroundColor: on ? '#08221D' : 'transparent',
      }}
    />
  );
}

function PlanRow({
  selected,
  onPress,
  title,
  price,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  price: string;
  badge?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 18,
        borderWidth: 1,
        backgroundColor: selected ? 'rgba(91,224,198,0.1)' : 'rgba(22,40,46,0.7)',
        borderColor: selected ? '#5BE0C6' : '#23383E',
      }}
    >
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>{title}</Text>
          {badge ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: '#0E1B1F', backgroundColor: '#5BE0C6', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' }}>
              {badge}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#7E9A9B' }}>{price}</Text>
      </View>
      <Radio on={selected} />
    </PressableScale>
  );
}

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setOnboardingComplete = useQuitStore((s) => s.setOnboardingComplete);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const now = useNow(250);
  const [plan, setPlan] = useState<Plan>('annual');

  const sec = Math.floor(msClean(quit, now) / 1000);
  const hms = `${pad(Math.floor(sec / 3600))} : ${pad(Math.floor((sec % 3600) / 60))} : ${pad(sec % 60)}`;

  const finish = () => {
    setOnboardingComplete(true);
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B181C', paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}>
      <PressableScale
        onPress={finish}
        style={{ position: 'absolute', top: insets.top + 8, right: 22, width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#23383E', backgroundColor: 'rgba(22,40,46,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
      >
        <Text style={{ fontSize: 18, color: '#9FB2B1' }}>×</Text>
      </PressableScale>

      <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
        <View style={{ gap: 9 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(91,224,198,0.12)', borderWidth: 1, borderColor: 'rgba(91,224,198,0.3)' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#5BE0C6' }} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: '#5BE0C6' }}>{hms} · running</Text>
          </View>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 31, color: '#EAF4F2', letterSpacing: -0.4 }}>Your plan is ready.</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#7E9A9B' }}>
            {"Your counter's already running. Keep it going with everything Clearway unlocks."}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <PlanRow selected={plan === 'annual'} onPress={() => setPlan('annual')} title="Annual" price="$29.99 / year · ≈ $2.50/mo" badge="BEST VALUE" />
          <PlanRow selected={plan === 'monthly'} onPress={() => setPlan('monthly')} title="Monthly" price="$4.99 / month" />
          <PlanRow selected={plan === 'lifetime'} onPress={() => setPlan('lifetime')} title="Lifetime" price="$49.99 once · clear forever" />
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#5BE0C6', fontSize: 14, letterSpacing: 2 }}>★★★★★</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: '#9FB2B1' }}>4.8</Text>
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#7E9A9B' }}>Join 100,000+ people clearing the air</Text>
        </View>
        <Cta label="Start 7-day free trial" onPress={finish} />
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#7E9A9B', textAlign: 'center' }}>No charge today · Cancel anytime</Text>
      </View>
    </View>
  );
}
