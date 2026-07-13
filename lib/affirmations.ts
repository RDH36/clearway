import type { Motivation } from '@/store/useQuitStore';

export type AffirmationMoment = 'early' | 'craving' | 'milestone' | 'general';

export type Affirmation = { id: string; text: string };

type Slots = { reason: string; days: number; money: string };

const HEALTH: string[] = [
  'Day {days}. Your lungs are already clearing — {reason} is worth every breath.',
  "{reason}. That's not a small thing. It's the whole thing. Keep going.",
  "Your body's been repairing since the moment you stopped. {days} days of it.",
  "The air's getting cleaner. So are you. One day closer to {reason}.",
  'Deeper breaths, better sleep, steadier energy. Day {days} is building all three.',
  'Your heart is doing less work for more life. {reason} — it shows.',
  'Stairs, walks, laughs — they all get easier from here. {days} days easier already.',
  "Taste and smell come back. Mornings come back. You're coming back — for {reason}.",
  'Every clean hour, your body says thank you in ways you can’t see yet.',
  '{days} days of healing you earned breath by breath. {reason}.',
  'Oxygen in, fog out. Your blood is cleaner today than it was on day one.',
  "You're not missing out on anything. You're getting your health back — {reason}.",
];

const MONEY: string[] = [
  '{money} back in your pocket. That used to go up in vapor. Not anymore.',
  "Day {days}. Every day clean is money that's yours again — {reason}.",
  "You're not spending it. You're keeping it. {money} and counting.",
  '{money} saved so far. Quiet, steady, yours.',
  'The habit had a subscription fee. You cancelled it. {money} says so.',
  'Day {days}: your wallet noticed before anyone else did. {reason}.',
  "{money} that didn't burn. Picture what it becomes instead.",
  'Every craving you skip is money you keep. Simple math, big total: {money}.',
  "You're paying yourself now. {days} days of deposits.",
  'The counter goes up even while you sleep. {money} and climbing — {reason}.',
  'Small daily amounts, huge yearly truth. Keep stacking, day {days}.',
  "That pocket money feeling, every single day. It's {money} now.",
];

const CONTROL: string[] = [
  'A small device used to decide your day. Not for {days} days. {reason}.',
  'You took the wheel back. {days} days of proving it to yourself.',
  '{reason}. Every craving you rode out was you choosing you.',
  'Nothing in your pocket owns you anymore. Day {days} of being free.',
  "You don't negotiate with it now. You just breathe and move on. {reason}.",
  '{days} days of decisions that were fully yours.',
  'The urge shows up, you stay in charge. That’s strength you built — {reason}.',
  'You broke the loop. Day {days} is you, running your own day.',
  "Discipline isn't loud. It's {days} quiet days in a row.",
  'You said "no more deciding for me." You meant it. {reason}.',
  'Each clean morning is a vote for the person in charge: you.',
  "Freedom isn't one big moment. It's {days} days of small ones. {reason}.",
];

const SOMEONE: string[] = [
  "You're doing this for {reason}. {days} days in, they'd be proud. So should you.",
  'Day {days}. The people you love get more of you now — clear-headed, present.',
  '{reason}. Some reasons are worth every hard minute. This is one.',
  'More years, more mornings, more moments — for {reason}.',
  "Someone's watching you do a hard thing and learning it's possible. {reason}.",
  'Day {days}: one more day fully there for the people who need you.',
  'You show love in the quietest way there is: by staying healthy for {reason}.',
  "They may never count your {days} days. You'll both feel them anyway.",
  'For {reason} — and honestly, for you too. Both deserve this.',
  'Being present is the gift. {days} days of showing up clear.',
  'The best promise is a kept one. Day {days} of keeping it — {reason}.',
  'One day they’ll know what you did here. {reason} was worth it.',
];

const UNIVERSAL: string[] = [
  'One breath at a time. That’s how {days} days got built.',
  'The air clears from here. It already has, a little.',
  "You've made it through 100% of your hardest days so far.",
  'Day {days}. Quiet progress is still progress.',
  "No lectures here. Just this: you're doing it.",
  'The fog lifts slowly, then all at once. Keep walking.',
  "Today doesn't need to be perfect. Just clean. You've got that.",
  '{days} days ago this felt impossible. Look at you.',
  'Cravings are waves. You’re becoming the shore.',
  'You quit once. Every morning since, you’ve confirmed it.',
  'Nothing to prove today — just one more day to live clear.',
  'Slow air, clear head, steady heart. Day {days}.',
];

const EARLY: string[] = [
  'Day {days} is the bravest one. {reason} — hold onto that today.',
  "The first days are the thickest air. You're breathing through them. {reason}.",
  'Right now your body is doing its biggest cleanup. Let it work.',
  "Day {days}: the hardest part is exactly where you are. It gets lighter.",
  'Every hour today counts double. You’re banking them one by one.',
  "The noise in your head is the habit leaving. It's loud before it's gone.",
  'Three days for the nicotine to leave. You’re already on your way — {reason}.',
  'Eat, drink water, breathe. That’s the whole job today.',
  "You don't need forever today. Just today. {reason}.",
  'The first clear morning is coming. Day {days} is buying it.',
  'Your only task: get to tonight. We’re with you the whole way.',
  'It feels like losing something. It’s the opposite. {reason}.',
];

const CRAVING: string[] = [
  'This one passes. They all do. Remember {reason}.',
  "Breathe. You've made it {days} days. One craving doesn't undo that.",
  'Right now is hard. {reason} is why it’s worth it. Ride it out.',
  'Three minutes. That’s all it asks. You have three minutes.',
  'The wave rises, peaks, falls. You’re already past the peak.',
  "Don't fight it — breathe through it. It has no power left after that.",
  'You’ve outlasted every single craving so far. This one loses too.',
  'It’s not hunger, not need — just an echo. Echoes fade. {reason}.',
  'Slow inhale. You’re still in charge here.',
  "After this one passes, you'll be glad you stayed. You always are.",
];

const MILESTONE: string[] = [
  '{days} days clear. You earned every one of them. {reason}.',
  'Look how far the air has cleared. This is what {reason} looks like.',
  'Day {days}. A milestone isn’t luck — it’s repetition. Yours.',
  '{days} days. Somewhere back there, this looked impossible.',
  'Mark it: {days} days. Then keep doing the thing that got you here.',
  'The record keeps growing: {days} days — and {reason} with it.',
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
    pool = [...EARLY, ...BY_MOTIVATION[motivation], ...UNIVERSAL];
    key = 'early';
  } else {
    pool = [...BY_MOTIVATION[motivation], ...UNIVERSAL];
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
