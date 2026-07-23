import { useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { useQuitStore, type SessionSlot } from '@/store/useQuitStore';
import { reasonLabel } from '@/lib/affirmations';
import { buildSessionPlan, shiftTime } from '@/lib/sessionPlan';
import { SessionTimes } from '@/components/onboarding/inputs/SessionTimes';
import { formatMoney } from '@/lib/format';
import { sendWelcomeNotification } from '@/lib/notifications';
import { haptics } from '@/lib/haptics';
import { track, useOnboardingStepTracked } from '@/lib/analytics';
import { useWidgetPin } from '@/hooks/useWidgetPin';
import { Shell } from '@/components/onboarding/Shell';
import { Cta } from '@/components/onboarding/Cta';
import { Toast } from '@/components/feedback/Toast';
import { Highlight } from '@/components/ui/Highlight';
import { fonts } from '@/constants/theme';

type Beat = 'ritual' | 'widget' | 'notif';

const CARD = {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: '#23383E',
  backgroundColor: 'rgba(22,40,46,0.72)',
  padding: 16,
} as const;

const HEADLINE: Record<Beat, string> = {
  ritual: "That's one. Let's put three in your day.",
  widget: 'Your progress, always in sight.',
  notif: "And at session time — we show up.",
};

const STEP: Record<Beat, string> = {
  ritual: 'Live it · 1 of 3',
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
  useOnboardingStepTracked('setup');
  const setNotifications = useQuitStore((s) => s.setNotifications);
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const firstReason = useQuitStore((s) => s.reasons[0]?.title);

  const userName = useQuitStore((s) => s.userName);
  const worstCravingTime = useQuitStore((s) => s.worstCravingTime);
  const usageFrequency = useQuitStore((s) => s.usageFrequency);
  const withoutIt = useQuitStore((s) => s.withoutIt);
  const quitFeeling = useQuitStore((s) => s.quitFeeling);
  const setSessions = useQuitStore((s) => s.setSessions);

  const generated = useMemo(
    () => buildSessionPlan({ worstCravingTime, usageFrequency, withoutIt, quitFeeling }),
    [worstCravingTime, usageFrequency, withoutIt, quitFeeling]
  );
  const [times, setTimes] = useState<Record<SessionSlot, string>>({
    morning: generated.plan.morning,
    midday: generated.plan.midday,
    evening: generated.plan.evening,
  });
  const [beat, setBeat] = useState<Beat>('ritual');
  const [toast, setToast] = useState<string | null>(null);
  const { status: pinStatus, request: requestWidgetPin } = useWidgetPin(() =>
    setToast('Widget added to your home screen')
  );
  const leavingRef = useRef(false);

  const reason = reasonLabel(firstReason, motivation);
  const dayMoney = formatMoney(weekly / 7);

  const toPaywall = () => router.push('/onboarding/paywall');

  const enableNotifs = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    const sent = await sendWelcomeNotification(reason, userName);
    setNotifications({ enabled: sent });
    track('notifications_enabled', { source: 'onboarding', granted: sent });
    if (sent) {
      haptics.milestone();
      setToast('Sent — check your notifications');
    } else {
      setToast('Allow notifications in your phone settings');
    }
    setTimeout(toPaywall, 1200);
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

        {beat === 'ritual' ? (
          <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp.duration(250)} style={{ gap: 14 }}>
            <SessionTimes
              times={times}
              anchor={generated.plan.anchor}
              onShift={(slot, minutes) => setTimes((t) => ({ ...t, [slot]: shiftTime(t[slot], minutes) }))}
            />
            <Highlight
              text="**Like the one you just did.** Placed to meet the craving **before it starts.**"
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
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: pinStatus === 'added' ? '#5BE0C6' : '#9FB4B3' }}>
                {pinStatus === 'added' ? '✓ On your home screen — see you tomorrow morning.' : 'Tomorrow morning, on your home screen.'}
              </Text>
            </View>
            <Highlight
              text={
                pinStatus === 'help'
                  ? '**Nothing appeared?** Long-press your home screen → **Widgets** → drag **Clearway** anywhere.'
                  : "**Every glance** at your phone — a reminder of **how far you've come.**"
              }
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
              text="**We nudge you at your session times.** Never shame. Say yes — this one arrives **right now.**"
              style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: '#9FB4B3' }}
            />
          </Animated.View>
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={{ gap: 12 }}>
          {beat === 'ritual' ? (
            <Cta
              label="Schedule my ritual →"
              onPress={() => {
                setSessions({ ...generated.plan, ...times, enabled: true });
                setBeat('widget');
              }}
            />
          ) : beat === 'widget' ? (
            <>
              {pinStatus === 'added' ? (
                <Cta label="Next →" onPress={() => setBeat('notif')} />
              ) : (
                <Cta label="Add the widget" onPress={requestWidgetPin} />
              )}
              <Skip label={pinStatus === 'help' ? "I'll do it later" : 'Maybe later'} onPress={() => setBeat('notif')} />
            </>
          ) : (
            <>
              <Cta label="Yes — check in on me" onPress={enableNotifs} />
              <Skip label="Not now" onPress={toPaywall} />
            </>
          )}
        </View>
      </View>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Shell>
  );
}
