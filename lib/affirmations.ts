import type { Motivation } from '@/store/useQuitStore';

export type AffirmationMoment = 'early' | 'craving' | 'milestone' | 'general';

export type Affirmation = { id: string; text: string };

type Slots = { reason: string; days: number; money: string };

const HEALTH: string[] = [
  'Day {days}. Your lungs are already clearing — {reason} is worth every breath.',
  "{reason}. That's not a small thing. It's the whole thing. Keep going.",
  "Your body's been repairing since the moment you stopped. {days} days of it.",
  "The air's getting cleaner. So are you. One day closer to {reason}.",
];

const MONEY: string[] = [
  '{money} back in your pocket. That used to go up in vapor. Not anymore.',
  "Day {days}. Every day clean is money that's yours again — {reason}.",
  "You're not spending it. You're keeping it. {money} and counting.",
];

const CONTROL: string[] = [
  'A small device used to decide your day. Not for {days} days. {reason}.',
  'You took the wheel back. {days} days of proving it to yourself.',
  '{reason}. Every craving you rode out was you choosing you.',
];

const SOMEONE: string[] = [
  "You're doing this for {reason}. {days} days in, they'd be proud. So should you.",
  'Day {days}. The people you love get more of you now — clear-headed, present.',
];

const EARLY: string[] = [
  'Day {days} is the bravest one. {reason} — hold onto that today.',
  "The first days are the thickest air. You're breathing through them. {reason}.",
];

const CRAVING: string[] = [
  'This one passes. They all do. Remember {reason}.',
  "Breathe. You've made it {days} days. One craving doesn't undo that.",
  'Right now is hard. {reason} is why it’s worth it. Ride it out.',
];

const MILESTONE: string[] = [
  '{days} days clear. You earned every one of them. {reason}.',
  'Look how far the air has cleared. This is what {reason} looks like.',
];

const BY_MOTIVATION: Record<Motivation, string[]> = {
  health: HEALTH,
  money: MONEY,
  control: CONTROL,
  someone: SOMEONE,
};

const fill = (text: string, slots: Slots) =>
  text
    .replaceAll('{reason}', slots.reason)
    .replaceAll('{days}', String(Math.max(1, slots.days)))
    .replaceAll('{money}', slots.money);

export function pickAffirmation(opts: {
  motivation: Motivation;
  moment: AffirmationMoment;
  seed: number;
  reason: string;
  days: number;
  money: string;
}): Affirmation {
  const { motivation, moment, seed } = opts;
  let pool: string[];
  let key: string;
  if (moment === 'craving') {
    pool = CRAVING;
    key = 'craving';
  } else if (moment === 'milestone') {
    pool = MILESTONE;
    key = 'milestone';
  } else if (moment === 'early' || opts.days <= 3) {
    pool = [...EARLY, ...BY_MOTIVATION[motivation]];
    key = 'early';
  } else {
    pool = BY_MOTIVATION[motivation];
    key = motivation;
  }
  const index = Math.abs(Math.floor(seed)) % pool.length;
  return { id: `${key}-${index}`, text: fill(pool[index], opts) };
}

export const shouldShowFreeTaste = (days: number) => days % 3 === 0;

const FALLBACK_REASON: Record<Motivation, string> = {
  health: 'your health',
  money: 'the money you keep',
  control: 'taking back control',
  someone: 'the people you love',
};

export const reasonLabel = (title: string | undefined, motivation: Motivation) =>
  title?.trim() || FALLBACK_REASON[motivation];
