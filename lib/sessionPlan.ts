import type { PatternId } from '@/lib/breathing';
import type { SessionPlan, SessionSlot } from '@/store/useQuitStore';

type PlanInput = {
  worstCravingTime: string;
  usageFrequency: string;
  withoutIt: string;
  quitFeeling: string;
};

const PATTERN_FOR: Record<string, PatternId> = {
  panic: 'calm478',
  irritable: 'box',
  focus: 'coherent',
  find_one: 'calm478',
};

const ANCHOR_FOR: Record<string, { slot: SessionSlot; time: string; reasoning: string }> = {
  Mornings: {
    slot: 'morning',
    time: '07:30',
    reasoning: "Mornings are when it hits you. We'll get ahead of it — a session at 7:30, before the pull starts.",
  },
  'After meals': {
    slot: 'midday',
    time: '13:00',
    reasoning: "The after-meal pull is your hardest. A 1 PM session lands right before it — you'll be ready.",
  },
  Stress: {
    slot: 'midday',
    time: '12:00',
    reasoning: "Stress is your trigger. A midday session resets you before the afternoon can pile up.",
  },
  Nights: {
    slot: 'evening',
    time: '21:00',
    reasoning: "Nights are when it hits you. We'll get ahead of it — a session at 9 PM, before the pull starts.",
  },
};

const TIGHT_FREQUENCIES = ['Constantly', "I've lost count"];

export function buildSessionPlan(input: PlanInput): { plan: SessionPlan; reasoning: string; tone: string } {
  const anchor = ANCHOR_FOR[input.worstCravingTime] ?? ANCHOR_FOR.Nights;
  const tight = TIGHT_FREQUENCIES.includes(input.usageFrequency);

  const times: Record<SessionSlot, string> = tight
    ? { morning: '09:00', midday: '13:30', evening: '19:30' }
    : { morning: '07:30', midday: '13:00', evening: '21:00' };
  times[anchor.slot] = anchor.time;
  if (input.worstCravingTime === 'Stress') times.evening = '17:30';

  const reassuring = input.quitFeeling === 'scared' || input.quitFeeling === 'unsure';
  const tone = reassuring
    ? 'Three small moments a day. No streaks to protect, no pressure — just air.'
    : "Three short sessions a day. That's the whole ritual — and it works.";

  return {
    plan: {
      morning: times.morning,
      midday: times.midday,
      evening: times.evening,
      enabled: true,
      anchor: anchor.slot,
      defaultPattern: PATTERN_FOR[input.withoutIt] ?? 'calm478',
    },
    reasoning: anchor.reasoning,
    tone,
  };
}

export const shiftTime = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const displayTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
};
