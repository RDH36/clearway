import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Orb } from '@/components/onboarding/Orb';
import { Highlight } from '@/components/ui/Highlight';
import { useQuitStore } from '@/store/useQuitStore';
import { track, useOnboardingStepTracked } from '@/lib/analytics';
import { fonts } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();
  useOnboardingStepTracked('welcome');
  const setUserName = useQuitStore((s) => s.setUserName);
  const [beat, setBeat] = useState<'hero' | 'name'>('hero');
  const [name, setName] = useState('');

  const toQuiz = (value: string | null) => {
    setUserName(value?.trim() || null);
    router.push('/onboarding/quiz');
  };

  if (beat === 'name') {
    return (
      <Shell>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, gap: 18 }}
          bottomOffset={24}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
            <Orb size={64} />
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 30, lineHeight: 36, color: '#EAF4F2', letterSpacing: -0.5 }}>
              What should we call you?
            </Text>
            <Highlight
              text={"Just a first name — so this feels like **your** journey.\nYou can skip this."}
              style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#9FB4B3' }}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#5C7375"
              maxLength={24}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => toQuiz(name)}
              style={{
                backgroundColor: 'rgba(11,24,28,0.6)',
                borderWidth: 1,
                borderColor: '#23383E',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontFamily: fonts.body,
                fontSize: 17,
                color: '#EAF4F2',
              }}
            />
          </Animated.View>
          <View style={{ gap: 12 }}>
            <Cta label={name.trim() ? `Nice to meet you, ${name.trim()} →` : 'Continue →'} onPress={() => toQuiz(name)} />
            <PressableScale onPress={() => toQuiz(null)} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#7E9A9B' }}>Skip for now</Text>
            </PressableScale>
          </View>
        </KeyboardAwareScrollView>
      </Shell>
    );
  }

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
        <Highlight
          text={'Quit vaping **one breath** at a time.\n**No lectures. No shame.**'}
          style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#AFC4C2', textAlign: 'center', maxWidth: 260 }}
        />
      </Animated.View>
      <Cta
        label="GET STARTED"
        onPress={() => {
          track('onboarding_started');
          setBeat('name');
        }}
      />
    </Shell>
  );
}
