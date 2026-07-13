import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { QuizCard } from '@/components/onboarding/QuizCard';
import { Orb } from '@/components/onboarding/Orb';
import { QUESTIONS, quizProgress, type QuizOption } from '@/components/onboarding/content';
import { useQuitStore } from '@/store/useQuitStore';
import { fonts } from '@/constants/theme';

export default function Quiz() {
  const router = useRouter();
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [locked, setLocked] = useState(false);

  const question = QUESTIONS[index];
  const picked = picks[index] ?? null;

  const select = (option: QuizOption) => {
    if (locked) return;
    setLocked(true);
    setPicks((p) => ({ ...p, [index]: option.label }));
    setQuizAnswers(option.patch);
    setTimeout(() => {
      if (index >= QUESTIONS.length - 1) router.push('/onboarding/empathy');
      else setIndex((i) => i + 1);
      setLocked(false);
    }, 1250);
  };

  const goBack = () => {
    if (locked || index === 0) return;
    setIndex((i) => i - 1);
  };

  return (
    <Shell progress={quizProgress(index)}>
      <View style={{ height: 40, justifyContent: 'center' }}>
        {index > 0 ? (
          <PressableScale
            onPress={goBack}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(22,40,46,0.72)', borderWidth: 1, borderColor: '#23383E' }}
          >
            <Text style={{ color: '#EAF4F2', fontSize: 18, marginTop: -2 }}>←</Text>
          </PressableScale>
        ) : null}
      </View>

      <Animated.View
        key={index}
        entering={index === 0 ? undefined : SlideInRight.duration(400)}
        exiting={SlideOutLeft.duration(350)}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <Orb size={74} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#5BE0C6', textTransform: 'uppercase' }}>
            {`Question ${index + 1} of ${QUESTIONS.length}`}
          </Text>
        </View>
        <QuizCard question={question} selectedLabel={picked} onSelect={select} />
      </Animated.View>
    </Shell>
  );
}
