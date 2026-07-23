import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import Animated, { FadeIn, FadeInDown, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { QuizCard } from '@/components/onboarding/QuizCard';
import { Orb } from '@/components/onboarding/Orb';
import { SpendSlider } from '@/components/onboarding/inputs/SpendSlider';
import { FrequencyScale } from '@/components/onboarding/inputs/FrequencyScale';
import { DayTimeline } from '@/components/onboarding/inputs/DayTimeline';
import { Cta } from '@/components/onboarding/Cta';
import { QUESTIONS, quizProgress, spendEcho, type QuizOption } from '@/components/onboarding/content';
import { useQuitStore, type QuitState } from '@/store/useQuitStore';
import { track, useOnboardingStepTracked } from '@/lib/analytics';
import { fonts } from '@/constants/theme';

const ECHO_MS = 2400;
const NAMED_ECHOES = new Set([1, 4]);

type Picked = { label: string; echo: string };

function SelectedChip({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
        paddingHorizontal: 20,
        borderRadius: 18,
        borderWidth: 1,
        backgroundColor: 'rgba(91,224,198,0.24)',
        borderColor: '#5BE0C6',
      }}
    >
      <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>{label}</Text>
      <Text style={{ fontSize: 15, color: '#5BE0C6' }}>→</Text>
    </View>
  );
}

export default function Quiz() {
  const router = useRouter();
  useOnboardingStepTracked('quiz');
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);
  const userName = useQuitStore((s) => s.userName);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [spend, setSpend] = useState(40);
  const pickedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = QUESTIONS[index];

  const advance = () => {
    if (!pickedRef.current) return;
    pickedRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPicked(null);
    if (index >= QUESTIONS.length - 1) router.push('/onboarding/empathy');
    else setIndex((i) => i + 1);
  };

  const answer = (patch: Partial<QuitState>, echoText: string, answerLabel: string) => {
    if (pickedRef.current) return;
    pickedRef.current = true;
    setQuizAnswers(patch);
    track('onboarding_quiz_answered', { question_index: index, question: question.id, answer: answerLabel });
    const named = userName && NAMED_ECHOES.has(index) ? `${userName} — ${echoText}` : echoText;
    setPicked({ label: answerLabel, echo: named });
    timer.current = setTimeout(advance, ECHO_MS);
  };

  const select = (option: QuizOption) => answer(option.patch, option.echo, option.label);

  const goBack = () => {
    if (picked || index === 0) return;
    setIndex((i) => i - 1);
  };

  return (
    <Shell progress={quizProgress(index)}>
      <View style={{ height: 40, justifyContent: 'center' }}>
        {index > 0 && !picked ? (
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

        <View style={{ gap: 16 }}>
          <View style={{ gap: 7 }}>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 25, lineHeight: 30, color: '#EAF4F2', letterSpacing: -0.3 }}>
              {question.question}
            </Text>
            {!picked ? (
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: '#94ABAA' }}>{question.why}</Text>
            ) : null}
          </View>

          {question.kind === 'cards' ? (
            <QuizCard question={question} selectedLabel={picked?.label ?? null} onSelect={select} />
          ) : null}
          {question.kind === 'scale' ? (
            !picked ? <FrequencyScale options={question.options} onSelect={select} /> : <SelectedChip label={picked.label} />
          ) : null}
          {question.kind === 'timeline' ? (
            !picked ? <DayTimeline options={question.options} onSelect={select} /> : <SelectedChip label={picked.label} />
          ) : null}
          {question.kind === 'slider' ? (
            !picked ? (
              <View style={{ gap: 18 }}>
                <SpendSlider value={spend} onChange={setSpend} />
                <Cta
                  label="That's my number →"
                  onPress={() => answer({ weeklySpend: spend, currency: 'USD' }, spendEcho(spend), `$${spend} a week`)}
                />
              </View>
            ) : (
              <SelectedChip label={picked.label} />
            )
          ) : null}

          {picked ? (
            <View style={{ minHeight: 128, gap: 14, paddingTop: 8 }}>
              <Animated.Text
                entering={FadeInDown.delay(200).duration(450)}
                style={{ fontFamily: fonts.displaySemibold, fontSize: 22, lineHeight: 29, color: '#EAF4F2', letterSpacing: -0.3 }}
              >
                {picked.echo}
              </Animated.Text>
              <Animated.Text
                entering={FadeIn.delay(900).duration(400)}
                style={{ fontFamily: fonts.body, fontSize: 12.5, color: '#7E9A9B' }}
              >
                Tap to continue
              </Animated.Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {picked ? <Pressable style={StyleSheet.absoluteFill} onPress={advance} /> : null}
    </Shell>
  );
}
