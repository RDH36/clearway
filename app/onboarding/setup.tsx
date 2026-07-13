import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { useQuitStore } from '@/store/useQuitStore';
import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { formatMoney } from '@/lib/format';
import { sendWelcomeNotification } from '@/lib/notifications';
import { haptics } from '@/lib/haptics';
import { requestPinClearwayWidget } from '@/modules/widget-pin';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Highlight } from '@/components/ui/Highlight';
import { fonts } from '@/constants/theme';

type Beat = 'affirmation' | 'widget' | 'notif';

const CARD = {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: '#23383E',
  backgroundColor: 'rgba(22,40,46,0.72)',
  padding: 16,
} as const;

const HEADLINE: Record<Beat, string> = {
  affirmation: 'Every morning, we hand you back your why.',
  widget: 'Your progress, always in sight.',
  notif: "And when it's hard — we show up.",
};

const STEP: Record<Beat, string> = {
  affirmation: 'Live it · 1 of 3',
  widget: 'Live it · 2 of 3',
  notif: 'Live it · 3 of 3',
};

function Skip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#7E9A9B' }}>{label}</Text>
    </PressableScale>
  );
}

export default function OnboardingSetup() {
  const router = useRouter();
  const setNotifications = useQuitStore((s) => s.setNotifications);
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const firstReason = useQuitStore((s) => s.reasons[0]?.title);

  const [beat, setBeat] = useState<Beat>('affirmation');

  const reason = reasonLabel(firstReason, motivation);
  const dayMoney = formatMoney(weekly / 7);
  const morning = pickAffirmation({ motivation, moment: 'general', seed: 6, reason, days: 1, money: dayMoney });

  const toPaywall = () => router.push('/onboarding/paywall');

  const addWidget = () => {
    requestPinClearwayWidget();
    haptics.tap();
    setBeat('notif');
  };

  const enableNotifs = async () => {
    setNotifications({ enabled: true });
    await sendWelcomeNotification(reason);
    haptics.milestone();
    toPaywall();
  };

  return (
    <Shell cleared>
      <View style={{ flex: 1, gap: 18 }}>
        <View style={{ gap: 9, paddingTop: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#5BE0C6', textTransform: 'uppercase' }}>
            {STEP[beat]}
          </Text>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 26, lineHeight: 31, color: '#EAF4F2', letterSpacing: -0.4 }}>
            {HEADLINE[beat]}
          </Text>
        </View>

        {beat === 'affirmation' ? (
          <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp.duration(250)} style={{ gap: 14 }}>
            <View style={[CARD, { flexDirection: 'row', gap: 11, borderColor: 'rgba(91,224,198,0.3)', backgroundColor: 'rgba(91,224,198,0.09)' }]}>
              <Text style={{ fontSize: 15, color: '#5BE0C6', lineHeight: 19 }}>✦</Text>
              <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#EAF4F2' }}>
                {morning.text}
              </Text>
            </View>
            <Highlight
              text="**From your words.** A fresh one **every morning.**"
              style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#9FB4B3' }}
            />
          </Animated.View>
        ) : null}

        {beat === 'widget' ? (
          <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp.duration(250)} style={{ gap: 14 }}>
            <View style={[CARD, { gap: 9 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 34, color: '#EAF4F2', letterSpacing: -1, lineHeight: 38 }}>1</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3', paddingBottom: 4 }}>day clear</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: '#5BE0C6', paddingBottom: 4 }}>{dayMoney} kept</Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(35,56,62,0.7)' }} />
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: '#9FB4B3' }}>
                Tomorrow morning, on your home screen.
              </Text>
            </View>
            <Highlight
              text="**Every glance** at your phone — a reminder of **how far you've come.**"
              style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#9FB4B3' }}
            />
          </Animated.View>
        ) : null}

        {beat === 'notif' ? (
          <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp.duration(250)} style={{ gap: 14 }}>
            <View style={[CARD, { flexDirection: 'row', gap: 11, alignItems: 'flex-start', backgroundColor: 'rgba(14,27,31,0.92)' }]}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(91,224,198,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, color: '#5BE0C6' }}>◍</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 13, color: '#EAF4F2' }}>{"We're with you"}</Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: '#7E9A9B' }}>now</Text>
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: '#9FB4B3' }}>
                  {`Day 1 starts now — for “${reason}.” One breath at a time.`}
                </Text>
              </View>
            </View>
            <Highlight
              text="**Once a day.** Never shame. Say yes — this one arrives **right now.**"
              style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#9FB4B3' }}
            />
          </Animated.View>
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={{ gap: 12 }}>
          {beat === 'affirmation' ? (
            <Cta label="Next →" onPress={() => setBeat('widget')} />
          ) : beat === 'widget' ? (
            <>
              <Cta label="Add the widget" onPress={addWidget} />
              <Skip label="Maybe later" onPress={() => setBeat('notif')} />
            </>
          ) : (
            <>
              <Cta label="Yes — check in on me" onPress={enableNotifs} />
              <Skip label="Not now" onPress={toPaywall} />
            </>
          )}
        </View>
      </View>
    </Shell>
  );
}
