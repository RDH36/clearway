import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Highlight } from '@/components/ui/Highlight';
import { SOLUTION_PROGRESS } from '@/components/onboarding/content';
import { useQuitStore } from '@/store/useQuitStore';
import { buildSessionPlan } from '@/lib/sessionPlan';
import { patternById, type PatternId } from '@/lib/breathing';
import { useOnboardingStepTracked } from '@/lib/analytics';
import { fonts } from '@/constants/theme';

export default function Solution() {
  const router = useRouter();
  useOnboardingStepTracked('solution');
  const userName = useQuitStore((s) => s.userName);
  const worstCravingTime = useQuitStore((s) => s.worstCravingTime);
  const usageFrequency = useQuitStore((s) => s.usageFrequency);
  const withoutIt = useQuitStore((s) => s.withoutIt);
  const quitFeeling = useQuitStore((s) => s.quitFeeling);

  const generated = useMemo(
    () => buildSessionPlan({ worstCravingTime, usageFrequency, withoutIt, quitFeeling }),
    [worstCravingTime, usageFrequency, withoutIt, quitFeeling]
  );
  const pattern = patternById(generated.plan.defaultPattern as PatternId);

  return (
    <Shell progress={SOLUTION_PROGRESS}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
        <Animated.View entering={FadeIn.duration(450)} style={{ gap: 8 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: '#5BE0C6', textTransform: 'uppercase' }}>
            {userName ? `${userName}, here's the plan` : "Here's the plan"}
          </Text>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 33, color: '#EAF4F2', letterSpacing: -0.4 }}>
            {generated.reasoning}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(600)} style={{ gap: 14 }}>
          <Highlight
            text={
              '**Three short breathing sessions a day** — placed around your hard moments, so the craving meets a tool instead of willpower.'
            }
            style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: '#C7D6D4' }}
          />
          <Highlight
            text={`Yours starts with **${pattern.name}** — picked for how cravings hit you. It's not relaxation. It's the thing you reach for **instead of the vape.**`}
            style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: '#C7D6D4' }}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(800).duration(600)}
          style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: '#A8BDBC' }}
        >
          {generated.tone}
        </Animated.Text>
      </View>
      <Cta label="Start my streak →" onPress={() => router.replace('/onboarding/wow')} />
    </Shell>
  );
}
