import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { PressableScale } from 'pressto';
import { useQuitStore } from '@/store/useQuitStore';
import { useNow } from '@/hooks/useNow';
import { msClean } from '@/lib/time';
import { haptics } from '@/lib/haptics';
import { purchasePlan, purchasesConfigured } from '@/lib/purchases';
import { usePremiumPrices } from '@/hooks/usePremiumPrices';
import { Cta } from '@/components/onboarding/Cta';
import { Highlight } from '@/components/ui/Highlight';
import { PlanPicker, type Plan } from '@/components/paywall/PlanPicker';
import { TransitionLoader } from '@/components/splash/TransitionLoader';
import { fonts } from '@/constants/theme';

const pad = (n: number) => String(n).padStart(2, '0');

function TrialOfferSheet({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
      <Animated.View entering={FadeIn.duration(220)} style={StyleSheet.absoluteFill}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,18,22,0.85)' }]} onPress={onDecline} />
      </Animated.View>
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          entering={SlideInDown.duration(320)}
          style={{
            backgroundColor: '#152A31',
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: '#3C5E68',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingTop: 14,
            paddingHorizontal: 26,
            paddingBottom: insets.bottom + 28,
            alignItems: 'center',
            gap: 16,
          }}
        >
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: '#2C474E' }} />
          <Text style={{ fontSize: 26, color: '#5BE0C6', lineHeight: 30 }}>✦</Text>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 24, color: '#EAF4F2', letterSpacing: -0.4, textAlign: 'center' }}>
              The first step deserves a gift.
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: '#C7D6D4', textAlign: 'center', maxWidth: 300 }}>
              {"Here's 3 days of Clearway premium — free, no card needed. Live it, then decide."}
            </Text>
          </View>
          <View style={{ alignSelf: 'stretch', gap: 10 }}>
            <Cta label="Start my 3 free days" onPress={onAccept} />
            <PressableScale onPress={onDecline} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#9FB4B3' }}>No thanks</Text>
            </PressableScale>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setOnboardingComplete = useQuitStore((s) => s.setOnboardingComplete);
  const quit = useQuitStore((s) => s.quitTimestamp);
  const trialUsed = useQuitStore((s) => s.trialUsed);
  const startTrial = useQuitStore((s) => s.startTrial);
  const firstReason = useQuitStore((s) => s.reasons[0]?.title?.trim());
  const now = useNow(250);
  const { prices, trials } = usePremiumPrices();
  const [plan, setPlan] = useState<Plan>('annual');
  const [entering, setEntering] = useState(false);
  const [offering, setOffering] = useState(false);
  const [buying, setBuying] = useState(false);

  const sec = Math.floor(msClean(quit, now) / 1000);
  const hms = `${pad(Math.floor(sec / 3600))} : ${pad(Math.floor((sec % 3600) / 60))} : ${pad(sec % 60)}`;

  // Show the smoke-styled loader first; only flip onboardingComplete once it
  // finishes, otherwise the onboarding layout's Redirect skips the transition.
  // enterHome MUST be stable — the paywall re-renders every 250ms (useNow), and
  // an unstable onDone would restart the loader's timer forever (never fires).
  const finish = () => setEntering(true);
  const dismiss = () => {
    if (!trialUsed) setOffering(true);
    else finish();
  };
  const buy = async () => {
    if (buying) return;
    if (!purchasesConfigured()) {
      finish();
      return;
    }
    setBuying(true);
    const { entitled } = await purchasePlan(plan);
    setBuying(false);
    if (entitled) {
      haptics.purchaseSuccess();
      finish();
    }
  };
  const acceptTrial = () => {
    startTrial();
    haptics.purchaseSuccess();
    setOffering(false);
    finish();
  };
  const enterHome = useCallback(() => {
    setOnboardingComplete(true);
    router.replace('/');
  }, [router, setOnboardingComplete]);

  if (entering) return <TransitionLoader onDone={enterHome} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B181C', paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}>
      <PressableScale
        onPress={dismiss}
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
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, lineHeight: 31, color: '#EAF4F2', letterSpacing: -0.4 }}>
            {"Don't stop what you just started."}
          </Text>
          <Highlight
            text={
              firstReason
                ? `Keep everything you just saw — for **“${firstReason}.”**`
                : "Keep everything you just saw **by your side.**"
            }
            style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#7E9A9B' }}
          />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 7 }}>
          {['Counter running', 'Your why saved', 'Widget in place', 'Daily support on'].map((item) => (
            <View key={item} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Text style={{ fontSize: 11, color: '#5BE0C6' }}>✓</Text>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12.5, color: '#C7D6D4' }}>{item}</Text>
            </View>
          ))}
        </View>

        <PlanPicker value={plan} onChange={setPlan} />
      </View>

      <View style={{ gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#5BE0C6', fontSize: 14, letterSpacing: 2 }}>★★★★★</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: '#9FB2B1' }}>4.8</Text>
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#7E9A9B' }}>Join 100,000+ people clearing the air</Text>
        </View>
        <Cta
          label={buying ? 'Opening Google Play…' : trials[plan] ? 'Start 7 days free' : 'Unlock Clearway Premium'}
          onPress={buy}
        />
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#7E9A9B', textAlign: 'center' }}>
          {trials[plan] ? `Free for 7 days, then ${prices[plan]} · Cancel anytime` : 'Cancel anytime · Secured by Google Play'}
        </Text>
      </View>

      {offering ? <TrialOfferSheet onAccept={acceptTrial} onDecline={() => { setOffering(false); finish(); }} /> : null}
    </View>
  );
}
