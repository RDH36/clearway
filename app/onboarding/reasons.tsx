import { useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { PressableScale } from 'pressto';
import { useQuitStore, type Motivation } from '@/store/useQuitStore';
import { pickAffirmation } from '@/lib/affirmations';
import { projectedYear } from '@/lib/money';
import { formatMoney } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useOnboardingStepTracked } from '@/lib/analytics';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Highlight } from '@/components/ui/Highlight';
import { fonts } from '@/constants/theme';

const REASONS_PROGRESS = 0.97;

const GLYPH: Record<Motivation, string> = { health: '✚', money: '$', control: '◎', someone: '♡' };

const MOTIVE_ECHO: Record<Motivation, string> = {
  health: 'You said this is about your health.',
  money: 'You said this is about the money it burns.',
  control: 'You said this is about taking back control.',
  someone: 'You said this is about someone you love.',
};

export default function OnboardingReasons() {
  const router = useRouter();
  useOnboardingStepTracked('reasons');
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const addReason = useQuitStore((s) => s.addReason);
  const [text, setText] = useState('');
  const [weaving, setWeaving] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);

  const reveal = () => {
    const title = text.trim();
    if (!title || weaving) return;
    Keyboard.dismiss();
    setWeaving(true);
    addReason({ id: `r-${Date.now()}`, glyph: GLYPH[motivation], title, note: '' });
    setTimeout(() => {
      const a = pickAffirmation({
        motivation,
        moment: 'early',
        seed: 1,
        reason: title,
        days: 1,
        money: formatMoney(projectedYear(weekly)),
      });
      setAffirmation(a.text);
      setWeaving(false);
      haptics.milestone();
    }, 1100);
  };

  const next = () => router.replace('/onboarding/wow');

  return (
    <Shell progress={REASONS_PROGRESS}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, gap: 18 }}
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 9, paddingTop: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' }}>
            One last thing
          </Text>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 32, color: '#EAF4F2', letterSpacing: -0.4 }}>
            {MOTIVE_ECHO[motivation]}
          </Text>
          <Highlight
            text="**Your words** carry more weight than ours ever will."
            style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#9FB4B3' }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#C7D6D4' }}>
            {'I’m quitting for…'}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="…my daughter. …running without wheezing. …me."
            placeholderTextColor="#5C7375"
            multiline
            maxLength={120}
            editable={affirmation === null}
            style={{
              backgroundColor: 'rgba(11,24,28,0.6)',
              borderWidth: 1,
              borderColor: affirmation ? 'rgba(91,224,198,0.4)' : '#23383E',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 16,
              minHeight: 88,
              textAlignVertical: 'top',
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: '#EAF4F2',
            }}
          />
        </View>

        {weaving ? (
          <Animated.Text
            entering={FadeIn.duration(250)}
            style={{ fontFamily: fonts.bodyMedium, fontSize: 13.5, color: '#5BE0C6', textAlign: 'center', paddingTop: 4 }}
          >
            Weaving it into your plan…
          </Animated.Text>
        ) : null}

        {affirmation ? (
          <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 11,
                padding: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: 'rgba(91,224,198,0.3)',
                backgroundColor: 'rgba(91,224,198,0.09)',
              }}
            >
              <Text style={{ fontSize: 16, color: '#5BE0C6', lineHeight: 20 }}>✦</Text>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, color: '#5BE0C6', textTransform: 'uppercase' }}>
                  Made from your words
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#EAF4F2' }}>
                  {affirmation}
                </Text>
              </View>
            </View>
            <Highlight
              text="**We bring it back** when it matters. **You're not alone.**"
              style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: '#9FB4B3', textAlign: 'center', paddingHorizontal: 10 }}
            />
          </Animated.View>
        ) : null}

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeIn.delay(300)} style={{ gap: 12 }}>
          {affirmation === null ? (
            weaving ? null : (
              <>
                <Cta label="That's my why →" onPress={reveal} />
                <PressableScale onPress={next} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#7E9A9B' }}>Skip for now</Text>
                </PressableScale>
              </>
            )
          ) : (
            <Cta label="Keep it close →" onPress={next} />
          )}
        </Animated.View>
      </KeyboardAwareScrollView>
    </Shell>
  );
}
