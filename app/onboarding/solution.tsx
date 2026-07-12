import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { SOLUTION_PROGRESS } from '@/components/onboarding/content';
import { useQuitStore } from '@/store/useQuitStore';
import { projectedYear } from '@/lib/money';
import { fonts } from '@/constants/theme';

const ICON = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: '#5BE0C6', strokeWidth: 1.7, strokeLinecap: 'round' } as const;

function ClockIcon() {
  return (
    <Svg {...ICON}>
      <Circle cx="12" cy="12" r="8.5" />
      <Path d="M12 7.5V12l3 2" />
    </Svg>
  );
}
function MoneyIcon() {
  return (
    <Svg {...ICON}>
      <Path d="M12 3v18" />
      <Path d="M16 7.5C16 5.6 14.2 4.5 12 4.5S8 5.6 8 7.5s1.8 2.7 4 3.2 4 1.4 4 3.3-1.8 3-4 3-4-1.1-4-3" />
    </Svg>
  );
}
function CraveIcon() {
  return (
    <Svg {...ICON}>
      <Circle cx="12" cy="12" r="8.5" />
      <Path d="M12 8.5a3.5 3.5 0 1 0 3.5 3.5" />
    </Svg>
  );
}

function Tile({ icon, title, body, delay }: { icon: React.ReactNode; title: string; body: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(22,40,46,0.72)',
        borderWidth: 1,
        borderColor: '#23383E',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(91,224,198,0.12)', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>{title}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: '#7E9A9B' }}>{body}</Text>
      </View>
    </Animated.View>
  );
}

export default function Solution() {
  const router = useRouter();
  const weekly = useQuitStore((s) => s.weeklySpend);
  const money = `~$${projectedYear(weekly).toLocaleString('en-US')} back this year`;

  return (
    <Shell progress={SOLUTION_PROGRESS}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <Animated.View entering={FadeIn.duration(450)} style={{ gap: 8 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>Your plan</Text>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 28, lineHeight: 32, color: '#EAF4F2', letterSpacing: -0.4 }}>
            {"Here's how the air clears."}
          </Text>
        </Animated.View>
        <View style={{ gap: 12 }}>
          <Tile icon={<ClockIcon />} title="Every second, counted" body="A live streak that never stops climbing." delay={50} />
          <Tile icon={<MoneyIcon />} title={money} body="Money that used to go up in vapor." delay={180} />
          <Tile icon={<CraveIcon />} title="Somewhere to go when it hits" body="A 90-second breathing tool for cravings." delay={310} />
        </View>
        <Animated.Text
          entering={FadeIn.delay(500).duration(600)}
          style={{ fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: '#A8BDBC', textAlign: 'center' }}
        >
          Built on the science of how nicotine leaves your body.
        </Animated.Text>
      </View>
      <Cta label="Build my plan →" onPress={() => router.replace('/onboarding/reasons')} />
    </Shell>
  );
}
