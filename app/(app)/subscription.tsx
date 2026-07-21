import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { usePremium } from '@/hooks/usePremium';
import { BackIcon } from '@/components/progress/icons';
import { Group, Row, SectionLabel, withAlpha } from '@/components/settings/SettingsGroup';
import { restorePurchases } from '@/components/settings/actions';
import { Toast } from '@/components/feedback/Toast';

const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

const planLabel = (productId: string) => {
  const id = productId.toLowerCase();
  if (id.includes('lifetime')) return 'Lifetime';
  if (id.includes('annual') || id.includes('year')) return 'Annual';
  if (id.includes('month')) return 'Monthly';
  return productId;
};

export default function Subscription() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, colors } = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const { entitled, entitlement, trialActive, trialDaysLeft, managementURL } = usePremium();

  const lifetime = entitled && (entitlement?.expirationDate == null || planLabel(entitlement.productIdentifier) === 'Lifetime');
  const expiresOn = fmtDate(entitlement?.expirationDate);
  const storeTrial = entitlement?.periodType === 'TRIAL';

  const headline = entitled ? (storeTrial ? 'Free trial' : 'Premium') : trialActive ? 'Free trial' : 'Free plan';
  const subline = entitled
    ? lifetime
      ? 'Yours forever — thank you for clearing the air with us.'
      : entitlement?.willRenew
        ? storeTrial
          ? `Your trial converts to Premium on ${expiresOn}.`
          : `Renews on ${expiresOn}.`
        : `Cancelled — Premium stays active until ${expiresOn}.`
    : trialActive
      ? `${trialDaysLeft} ${trialDaysLeft === 1 ? 'day' : 'days'} left. Every feature is unlocked.`
      : 'Your streak keeps counting. Premium brings the full toolkit back.';

  const restore = async () => {
    if (restoring) return;
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    setToast(restored ? 'Premium restored' : 'No purchase found for this account');
  };

  const openStore = () => Linking.openURL(managementURL ?? PLAY_SUBSCRIPTIONS_URL);

  return (
    <View style={{ flex: 1, backgroundColor: colors.base }}>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />

      <View style={{ flex: 1, paddingTop: insets.top + 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, marginBottom: 14 }}>
          <PressableScale
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: withAlpha(colors.surface, 0.5),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BackIcon color={colors.ink} />
          </PressableScale>
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, color: colors.ink, letterSpacing: -0.4 }}>
            Subscription
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 34, gap: 22 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: entitled || trialActive ? 'rgba(91,224,198,0.35)' : colors.line,
              backgroundColor: entitled || trialActive ? 'rgba(91,224,198,0.08)' : withAlpha(colors.surface, 0.5),
              padding: 18,
              gap: 7,
            }}
          >
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#5BE0C6', textTransform: 'uppercase' }}>
              ✦ Your plan
            </Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 26, color: colors.ink, letterSpacing: -0.4 }}>
              {headline}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>{subline}</Text>
          </View>

          {entitled && entitlement ? (
            <View style={{ gap: 9 }}>
              <SectionLabel>Details</SectionLabel>
              <Group>
                <Row label="Plan" value={planLabel(entitlement.productIdentifier)} />
                <Row label="Status" value={lifetime ? 'Lifetime' : entitlement.willRenew ? 'Active' : 'Cancelled'} />
                {!lifetime && expiresOn ? (
                  <Row label={entitlement.willRenew ? 'Renews on' : 'Premium until'} value={expiresOn} />
                ) : null}
              </Group>
            </View>
          ) : null}

          <View style={{ gap: 9 }}>
            <SectionLabel>Manage</SectionLabel>
            <Group>
              {!entitled ? <Row label="See premium plans" onPress={() => router.push('/paywall')} /> : null}
              {entitled && !lifetime ? <Row label="Manage in Google Play" onPress={openStore} /> : null}
              <Row label={restoring ? 'Restoring…' : 'Restore purchases'} onPress={restore} />
            </Group>
          </View>

          {entitled && !lifetime ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.muted, paddingHorizontal: 4 }}>
              Cancelling never cuts you off early — Premium stays until the end of your paid or trial period.
            </Text>
          ) : null}
        </ScrollView>
      </View>

      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}
