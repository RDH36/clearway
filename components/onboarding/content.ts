import type { QuitState } from '@/store/useQuitStore';

export const CLARITY_HAZE = 0.12;
export const CLARITY_CLEAR = 0.52;

export type QuizOption = {
  label: string;
  patch: Partial<QuitState>;
  echo: string;
  sub?: string;
};

export type QuizKind = 'cards' | 'slider' | 'scale' | 'timeline';

export type QuizQuestion = {
  id: string;
  question: string;
  why: string;
  kind: QuizKind;
  options: QuizOption[];
};

export const spendEcho = (weekly: number) =>
  `$${(weekly * 52).toLocaleString('en-US')} a year. You'll watch it come back.`;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'why',
    question: "What's pushing you to quit?",
    why: 'Your reason becomes your anchor on hard days.',
    kind: 'cards',
    options: [
      { label: 'Health', patch: { primaryMotivation: 'health' }, echo: 'Within 72 hours, your lungs start repairing. They were just waiting on you.' },
      { label: 'Money', patch: { primaryMotivation: 'money' }, echo: "It adds up faster than anyone admits. You'll see your number in a minute." },
      { label: 'Control', patch: { primaryMotivation: 'control' }, echo: 'Control is the one reason that never runs out.' },
      { label: 'Someone I care about', patch: { primaryMotivation: 'someone' }, echo: 'Quitting for someone is still quitting for you. Both count.' },
    ],
  },
  {
    id: 'tried_before',
    question: 'Have you tried to quit before?',
    why: 'Past tries are practice, not failure.',
    kind: 'cards',
    options: [
      { label: 'Never', patch: { triedBefore: 'never' }, echo: 'First real try — you get to skip the lessons others learned the hard way.' },
      { label: 'Once', patch: { triedBefore: 'once' }, echo: "You know exactly where it broke last time. That's intel, not defeat." },
      { label: 'A few times', patch: { triedBefore: 'few' }, echo: 'Each round taught your brain something. This one comes with a plan.' },
      { label: "I've lost count", patch: { triedBefore: 'lost_count' }, echo: "That's not failure — that's practice." },
    ],
  },
  {
    id: 'frequency',
    question: 'How often do you reach for it?',
    why: 'This shapes the rhythm we build for you.',
    kind: 'scale',
    options: [
      { label: 'A few times a day', patch: { usageFrequency: 'A few times a day' }, echo: "A few fixed anchors. We'll replace them one by one." },
      { label: 'Hourly', patch: { usageFrequency: 'Hourly' }, echo: "Every hour, a decision. We'll be there for the hardest ones." },
      { label: 'Constantly', patch: { usageFrequency: 'Constantly' }, echo: "When it's constant, willpower isn't the tool. Rhythm is." },
      { label: "I've lost count", patch: { usageFrequency: "I've lost count" }, echo: "That's the honest answer. It's also exactly why this works." },
    ],
  },
  {
    id: 'spend',
    question: 'What do you spend a week?',
    why: 'Drag to your number — watch what a year looks like.',
    kind: 'slider',
    options: [],
  },
  {
    id: 'worst',
    question: 'When does it hit hardest?',
    why: 'Tap the moment in your day.',
    kind: 'timeline',
    options: [
      { label: 'Mornings', sub: '7 AM', patch: { worstCravingTime: 'Mornings' }, echo: 'Mornings. Before the day even asks anything of you.' },
      { label: 'After meals', sub: '1 PM', patch: { worstCravingTime: 'After meals' }, echo: 'The after-meal pull — the oldest trigger there is.' },
      { label: 'Stress', sub: 'Any hour', patch: { worstCravingTime: 'Stress' }, echo: 'Stress cravings are the loudest. And the fastest to pass.' },
      { label: 'Nights', sub: '9 PM', patch: { worstCravingTime: 'Nights' }, echo: 'Nights. The quiet hours are the hardest.' },
    ],
  },
  {
    id: 'without_it',
    question: "What happens when you don't have it on you?",
    why: 'This tells us which tool to hand you first.',
    kind: 'cards',
    options: [
      { label: 'Panic a little', patch: { withoutIt: 'panic' }, echo: 'That panic is the nicotine talking. Not you.' },
      { label: 'Get irritable', patch: { withoutIt: 'irritable' }, echo: "The edge fades after day three. We'll walk you there." },
      { label: "Can't focus", patch: { withoutIt: 'focus' }, echo: 'The fog is withdrawal, not you. It lifts.' },
      { label: 'I just find one', patch: { withoutIt: 'find_one' }, echo: "Honest. That's the exact loop we're breaking — gently." },
    ],
  },
  {
    id: 'feeling',
    question: 'And right now — how does quitting feel?',
    why: "There's no wrong answer.",
    kind: 'cards',
    options: [
      { label: 'Scared', patch: { quitFeeling: 'scared' }, echo: 'Scared means it matters. You came anyway.' },
      { label: 'Ready', patch: { quitFeeling: 'ready' }, echo: "Then let's not waste a single day of it." },
      { label: 'Tired of it', patch: { quitFeeling: 'tired' }, echo: 'That exhaustion is fuel. Use it.' },
      { label: 'Not sure', patch: { quitFeeling: 'unsure' }, echo: "You don't need sure. Willing is enough." },
    ],
  },
];

export const quizProgress = (index: number) => 0.1 + index * 0.09;
export const EMPATHY_PROGRESS = 0.7;
export const SOLUTION_PROGRESS = 0.88;

const TRIED_PHRASE: Record<string, string> = {
  never: 'Your first real try',
  once: 'Round two',
  few: "You've been here before",
  lost_count: 'After every past try',
};
const WORST_LOWER: Record<string, string> = {
  Mornings: 'the mornings',
  'After meals': 'the moments after a meal',
  Stress: 'the stressful days',
  Nights: 'the nights',
};
const WORST_CAP: Record<string, string> = {
  Mornings: 'morning',
  'After meals': 'post-meal',
  Stress: 'stress',
  Nights: 'night',
};

const FEELING_LINE: Record<string, string> = {
  scared: '**Scared?** Good — that means it matters. And you started anyway.',
  ready: '**Ready.** We believe you.',
  tired: '**Tired of it?** That tiredness is the way out.',
  unsure: '**Not sure?** Willing beats certain — every day.',
};

export const worstPhrase = (worst: string) => WORST_LOWER[worst] ?? 'the hard moments';

export function buildEmpathy(triedBefore: string, worstCravingTime: string, quitFeeling = '') {
  const tried = TRIED_PHRASE[triedBefore] ?? 'This try';
  const worst = worstCravingTime || 'Nights';
  return {
    mirror: `${tried} — and it's ${WORST_LOWER[worst]} that get you.`,
    feeling: FEELING_LINE[quitFeeling] ?? null,
    proof: `**You're not alone.** ${WORST_CAP[worst]} cravings break the most streaks — **we built for exactly that.**`,
  };
}
