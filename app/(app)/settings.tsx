import { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'pressto';
import Constants from 'expo-constants';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore } from '@/store/useQuitStore';
import { usePremium } from '@/hooks/usePremium';
import { BackIcon } from '@/components/progress/icons';
import { Group, Row, SectionLabel, withAlpha } from '@/components/settings/SettingsGroup';
import { Toggle } from '@/components/settings/Toggle';
import { AppearanceRow } from '@/components/settings/AppearanceRow';
import { PRIVACY_URL, TERMS_URL, rateApp, shareApp } from '@/components/settings/actions';
import { useWidgetPin } from '@/hooks/useWidgetPin';
import { ensureNotificationPermission } from '@/lib/notifications';
import { haptics } from '@/lib/haptics';
import { track } from '@/lib/analytics';
import { Toast } from '@/components/feedback/Toast';
import { WidgetHelpSheet } from '@/components/feedback/WidgetHelpSheet';
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet';
import { QuitDateSheet } from '@/components/settings/sheets/QuitDateSheet';
import { CURRENCY_SYMBOL, FrequencySheet, WeeklyCostSheet } from '@/components/settings/sheets/EditValueSheets';
import { ReminderTimeSheet, SessionTimeSheet, formatTime12 } from '@/components/settings/sheets/ReminderTimeSheet';
import { SLOT_LABEL, SLOT_ORDER } from '@/lib/ritual';
import type { SessionSlot } from '@/store/useQuitStore';
import { ConfirmDeleteSheet } from '@/components/settings/sheets/ConfirmDeleteSheet';

type Sheet = 'date' | 'cost' | 'frequency' | 'time' | 'delete' | 'feedback' | null;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 9 }}>
      <SectionLabel>{label}</SectionLabel>
      <Group>{children}</Group>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, colors } = useTheme();

  const quitTimestamp = useQuitStore((s) => s.quitTimestamp);
  const weeklySpend = useQuitStore((s) => s.weeklySpend);
  const currency = useQuitStore((s) => s.currency);
  const usageFrequency = useQuitStore((s) => s.usageFrequency);
  const reasonsCount = useQuitStore((s) => s.reasons.length);
  const notifications = useQuitStore((s) => s.notifications);
  const setNotifications = useQuitStore((s) => s.setNotifications);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [ritualSlot, setRitualSlot] = useState<SessionSlot | null>(null);
  const sessions = useQuitStore((s) => s.sessions);
  const setSessions = useQuitStore((s) => s.setSessions);
  const [toast, setToast] = useState<string | null>(null);
  const { isPremium } = usePremium();
  const {
    status: pinStatus,
    request: requestWidgetPin,
    dismissHelp,
  } = useWidgetPin(() => setToast('Widget added to your home screen'));

  const quitDateLabel = quitTimestamp
    ? new Date(quitTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const version = `${Constants.expoConfig?.version ?? '1.0.0'} (${Constants.nativeBuildVersion ?? '—'})`;

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
            Settings
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 34, gap: 22 }}
          showsVerticalScrollIndicator={false}
        >
          <Section label="Your quit">
            <Row label="Quit date" value={quitDateLabel} onPress={() => setSheet('date')} />
            <Row label="Weekly cost" value={`${CURRENCY_SYMBOL[currency]}${weeklySpend}`} onPress={() => setSheet('cost')} />
            <Row label="Frequency" value={usageFrequency || '—'} onPress={() => setSheet('frequency')} />
            <Row label="My reasons" value={String(reasonsCount)} onPress={() => router.push('/reasons')} />
            <Row label="Reset / start over" danger onPress={() => router.push('/reset')} />
          </Section>

          <Section label="Ritual">
            <Row
              label="Daily sessions"
              right={
                <Toggle
                  value={sessions.enabled}
                  onChange={(enabled) => {
                    haptics.tap();
                    setSessions({ enabled });
                  }}
                />
              }
            />
            {sessions.enabled
              ? SLOT_ORDER.map((slot) => (
                  <Row
                    key={slot}
                    label={`${SLOT_LABEL[slot]} session`}
                    value={formatTime12(sessions[slot])}
                    onPress={() => setRitualSlot(slot)}
                  />
                ))
              : null}
          </Section>

          <Section label="App">
            <AppearanceRow />
            <Row
              label="Notifications"
              right={
                <Toggle
                  value={notifications.enabled}
                  onChange={async (enabled) => {
                    haptics.tap();
                    if (!enabled) {
                      setNotifications({ enabled: false });
                      return;
                    }
                    const granted = await ensureNotificationPermission();
                    setNotifications({ enabled: granted });
                    track('notifications_enabled', { source: 'settings', granted });
                    setToast(granted ? 'Daily reminder is on' : 'Allow notifications in your phone settings');
                  }}
                />
              }
            />
            {notifications.enabled ? (
              <Row label="Daily reminder" value={formatTime12(notifications.dailyTime)} onPress={() => setSheet('time')} />
            ) : null}
            {Platform.OS === 'android' ? (
              <Row label="Add widget to home screen" onPress={requestWidgetPin} />
            ) : null}
          </Section>

          <Section label="Premium">
            <Row
              label="My subscription"
              value={isPremium ? 'Premium' : 'Free'}
              onPress={() => router.push('/subscription')}
            />
          </Section>

          <Section label="Support">
            <Row label="Rate the app" onPress={() => rateApp()} />
            <Row label="Send feedback" onPress={() => setSheet('feedback')} />
            <Row label="Share Clearway" onPress={shareApp} />
          </Section>

          <Section label="About">
            <Row label="Privacy policy" onPress={() => Linking.openURL(PRIVACY_URL)} />
            <Row label="Terms of service" onPress={() => Linking.openURL(TERMS_URL)} />
            <Row
              label="Version"
              right={<Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>{version}</Text>}
            />
            <Row label="Delete my data" danger onPress={() => setSheet('delete')} />
            {__DEV__ ? <Row label="🔧 Debug tools" onPress={() => router.push('/debug')} /> : null}
          </Section>
        </ScrollView>
      </View>

      {sheet === 'date' ? <QuitDateSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'cost' ? <WeeklyCostSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'frequency' ? <FrequencySheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'time' ? <ReminderTimeSheet onClose={() => setSheet(null)} /> : null}
      {ritualSlot ? <SessionTimeSheet slot={ritualSlot} onClose={() => setRitualSlot(null)} /> : null}
      {sheet === 'delete' ? <ConfirmDeleteSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'feedback' ? <FeedbackSheet onClose={() => setSheet(null)} /> : null}
      {pinStatus === 'help' ? <WidgetHelpSheet onClose={dismissHelp} /> : null}
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}
