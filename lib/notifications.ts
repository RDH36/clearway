import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { affirmationAt, nextOccurrences, occurrenceKey } from '@/lib/scheduleWindow';
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

export const NOTIF_CHANNEL_ID = 'support';
const CHANNEL_ID = NOTIF_CHANNEL_ID;
const DAILY_DATA_TYPE = 'daily_support';
const dailyNotifId = (at: Date) => `clearway-daily-${occurrenceKey(at)}`;
// Ritual slots take shifts 0/7/14, so the daily nudge sits at 21 — otherwise it
// would land on the same affirmation as the morning session on the same day.
const DAILY_SEED_SHIFT = 21;

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

async function getDailyNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((req) => {
    const data = req.content?.data as { type?: string } | null | undefined;
    return data?.type === DAILY_DATA_TYPE || req.identifier.startsWith('clearway-daily');
  });
}

export async function syncEncouragementSchedule(state: EncouragementState, isPremium: boolean) {
  try {
    const enabled = isPremium && state.notifications.enabled;
    const desired = enabled ? nextOccurrences(state.notifications.dailyTime) : [];

    const scheduled = await getDailyNotifications();
    const live = new Set(scheduled.map((req) => req.identifier));
    const inSync =
      scheduled.length === desired.length && desired.every((at) => live.has(dailyNotifId(at)));
    if (inSync) return;

    for (const req of scheduled) {
      try {
        await Notifications.cancelScheduledNotificationAsync(req.identifier);
      } catch {
        continue;
      }
    }
    if (!desired.length) return;
    const granted = await ensureNotificationPermission();
    if (!granted) return;

    for (const at of desired) {
      await Notifications.scheduleNotificationAsync({
        identifier: dailyNotifId(at),
        content: {
          title: 'Clearway',
          body: affirmationAt(state, at, DAILY_SEED_SHIFT),
          data: { type: DAILY_DATA_TYPE },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
      });
    }
  } catch {
    return;
  }
}
