import * as Notifications from 'expo-notifications';
import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { NOTIF_CHANNEL_ID } from '@/lib/notifications';
import { msClean } from '@/lib/time';
import { moneySaved } from '@/lib/money';
import { formatMoney } from '@/lib/format';
import { DAY_MS } from '@/constants/time';
import type { Motivation, NotificationPrefs, Reason, SessionLog, SessionPlan, SessionSlot } from '@/store/useQuitStore';

export const SLOT_ORDER: SessionSlot[] = ['morning', 'midday', 'evening'];

export const SLOT_LABEL: Record<SessionSlot, string> = {
  morning: 'Morning',
  midday: 'Midday',
  evening: 'Evening',
};

const sessionNotifId = (slot: SessionSlot) => `clearway-session-${slot}`;

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const doneToday = (log: SessionLog): SessionSlot[] => (log.date === todayKey() ? log.done : []);

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

export function nextSession(
  sessions: SessionPlan,
  done: SessionSlot[] = [],
  now = new Date()
): { slot: SessionSlot; time: string; tomorrow: boolean } {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const slot of SLOT_ORDER) {
    if (!done.includes(slot) && minutesOf(sessions[slot]) > nowMin) {
      return { slot, time: sessions[slot], tomorrow: false };
    }
  }
  return { slot: 'morning', time: sessions.morning, tomorrow: true };
}

export function startableSlot(sessions: SessionPlan, done: SessionSlot[], now = new Date()): SessionSlot {
  const next = nextSession(sessions, done, now);
  if (!next.tomorrow) return next.slot;
  for (const slot of [...SLOT_ORDER].reverse()) {
    if (!done.includes(slot)) return slot;
  }
  return 'morning';
}

export type RitualState = {
  sessions: SessionPlan;
  notifications: NotificationPrefs;
  userName: string | null;
  primaryMotivation: Motivation;
  reasons: Reason[];
  weeklySpend: number;
  quitTimestamp: number | null;
};

let lastSyncKey = '';

export async function syncRitualSchedule(state: RitualState) {
  try {
    const enabled = state.sessions.enabled && state.notifications.enabled;
    const key = enabled
      ? `${state.sessions.morning}|${state.sessions.midday}|${state.sessions.evening}|${state.userName ?? ''}|${state.primaryMotivation}|${state.reasons[0]?.title ?? ''}`
      : 'off';
    if (key === lastSyncKey) return;
    lastSyncKey = key;

    for (const slot of SLOT_ORDER) {
      await Notifications.cancelScheduledNotificationAsync(sessionNotifId(slot));
    }
    if (!enabled) return;
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;

    const ms = msClean(state.quitTimestamp);
    const days = Math.max(1, Math.floor(ms / DAY_MS));
    const reason = reasonLabel(state.reasons[0]?.title, state.primaryMotivation);
    const money = formatMoney(moneySaved(state.weeklySpend, Math.max(ms, DAY_MS)));

    for (let i = 0; i < SLOT_ORDER.length; i++) {
      const slot = SLOT_ORDER[i];
      const [hour, minute] = state.sessions[slot].split(':').map(Number);
      const affirmation = pickAffirmation({
        motivation: state.primaryMotivation,
        moment: 'general',
        seed: days + i * 7,
        reason,
        days,
        money,
        name: state.userName,
      });
      await Notifications.scheduleNotificationAsync({
        identifier: sessionNotifId(slot),
        content: {
          title: state.userName ? `${state.userName} — ${SLOT_LABEL[slot].toLowerCase()} session ✦` : `${SLOT_LABEL[slot]} session ✦`,
          body: affirmation.text,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Number.isFinite(hour) ? hour : 9,
          minute: Number.isFinite(minute) ? minute : 0,
          channelId: NOTIF_CHANNEL_ID,
        },
      });
    }
  } catch {
    return;
  }
}
