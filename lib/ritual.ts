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
const RITUAL_DATA_TYPE = 'ritual_session';

type RitualNotifData = { type?: string; slot?: string; time?: string };

// On Android, expo-notifications does not always honor a custom `identifier`
// for repeating triggers (stored under an auto-generated UUID instead), so an
// identifier-based cancel can match nothing and leave duplicates behind on
// every reschedule. Enumerate and match on data.type + identifier prefix.
async function getRitualNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((req) => {
    const data = req.content?.data as RitualNotifData | null | undefined;
    return data?.type === RITUAL_DATA_TYPE || req.identifier.startsWith('clearway-session-');
  });
}

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

// MIUI/SmartPower can freeze the app seconds after it goes to background,
// stranding an in-flight cancel+reschedule for hours. Never trust an
// in-memory "already synced" flag: reconcile against what the OS actually
// has scheduled, on every call — the caller re-runs this on app foreground.
export async function syncRitualSchedule(state: RitualState, isPremium: boolean) {
  try {
    const enabled = state.sessions.enabled && state.notifications.enabled;
    const slots = isPremium ? SLOT_ORDER : [state.sessions.anchor];
    const desired = enabled ? slots.map((slot) => ({ slot, time: state.sessions[slot] })) : [];

    const scheduled = await getRitualNotifications();
    const inSync =
      scheduled.length === desired.length &&
      desired.every((d) =>
        scheduled.some((req) => {
          const data = req.content?.data as RitualNotifData | null | undefined;
          return data?.slot === d.slot && data?.time === d.time;
        })
      );
    if (inSync) return;

    for (const req of scheduled) {
      try {
        await Notifications.cancelScheduledNotificationAsync(req.identifier);
      } catch {
        continue;
      }
    }
    if (!desired.length) return;
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;

    const ms = msClean(state.quitTimestamp);
    const days = Math.max(1, Math.floor(ms / DAY_MS));
    const reason = reasonLabel(state.reasons[0]?.title, state.primaryMotivation);
    const money = formatMoney(moneySaved(state.weeklySpend, Math.max(ms, DAY_MS)));

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
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
          data: { type: RITUAL_DATA_TYPE, slot, time: state.sessions[slot] },
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
