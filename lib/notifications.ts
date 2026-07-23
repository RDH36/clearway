import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { msClean } from '@/lib/time';
import { moneySaved } from '@/lib/money';
import { formatMoney } from '@/lib/format';
import { DAY_MS } from '@/constants/time';
import type { Motivation, NotificationPrefs, Reason } from '@/store/useQuitStore';

export function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const CHANNEL_ID = 'support';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Encouragement',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: '#5BE0C6',
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function sendWelcomeNotification(reason: string, name?: string | null): Promise<boolean> {
  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return false;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: name ? `We're with you, ${name}` : "We're with you",
        body: `Day 1 starts now — for “${reason}.” One breath at a time.`,
      },
      trigger: { channelId: CHANNEL_ID },
    });
    return true;
  } catch {
    return false;
  }
}

export type EncouragementState = {
  quitTimestamp: number | null;
  weeklySpend: number;
  primaryMotivation: Motivation;
  reasons: Reason[];
  notifications: NotificationPrefs;
  userName: string | null;
};

let lastSyncKey = '';

export async function syncEncouragementSchedule(state: EncouragementState, isPremium: boolean) {
  try {
    const [rawHour, rawMinute] = state.notifications.dailyTime.split(':').map(Number);
    const hour = Number.isFinite(rawHour) ? rawHour : 9;
    const minute = Number.isFinite(rawMinute) ? rawMinute : 0;

    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);

    const enabled = isPremium && state.notifications.enabled;
    const key = enabled
      ? `${hour}:${minute}|${state.quitTimestamp}|${next.toDateString()}|${state.reasons[0]?.title ?? ''}`
      : 'off';
    if (key === lastSyncKey) return;
    lastSyncKey = key;

    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    const granted = await ensureNotificationPermission();
    if (!granted) return;

    const msAtDelivery = msClean(state.quitTimestamp, next.getTime());
    const days = Math.max(1, Math.floor(msAtDelivery / DAY_MS));
    const affirmation = pickAffirmation({
      motivation: state.primaryMotivation,
      moment: 'general',
      seed: days,
      reason: reasonLabel(state.reasons[0]?.title, state.primaryMotivation),
      name: state.userName,
      days,
      money: formatMoney(moneySaved(state.weeklySpend, msAtDelivery)),
    });

    await Notifications.scheduleNotificationAsync({
      content: { title: 'Clearway', body: affirmation.text },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: next, channelId: CHANNEL_ID },
    });
  } catch {
    return;
  }
}
