import type { QuitState } from '@/store/useQuitStore';

export const CLARITY_HAZE = 0.12;
export const CLARITY_CLEAR = 0.52;

export type QuizOption = {
  label: string;
  patch: Partial<QuitState>;
  echo: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  why: string;
  options: QuizOption[];
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'why',
    question: "What's pushing you to quit?",
    why: 'Your reason becomes your anchor on hard days.',
    options: [
      { label: 'Health', patch: { primaryMotivation: 'health' }, echo: "Your body's been waiting for this." },
      { label: 'Money', patch: { primaryMotivation: 'money' }, echo: 'Fair. It adds up faster than anyone admits.' },
      { label: 'Control', patch: { primaryMotivation: 'control' }, echo: 'The strongest reason there is.' },
      { label: 'Someone I care about', patch: { primaryMotivation: 'someone' }, echo: "They're lucky to have you fighting for this." },
    ],
  },
  {
    id: 'duration',
    question: 'How long have you been vaping?',
    why: 'We tailor the timeline to your history.',
    options: [
      { label: 'Less than a year', patch: { vapingDuration: 'Less than a year' }, echo: 'Early enough to make this much easier.' },
      { label: '1–2 years', patch: { vapingDuration: '1–2 years' }, echo: "Long enough to know it's time." },
      { label: '3–5 years', patch: { vapingDuration: '3–5 years' }, echo: "That's a real chapter. It can close." },
      { label: '5+ years', patch: { vapingDuration: '5+ years' }, echo: "After all this time — it's still fully reversible." },
    ],
  },
  {
    id: 'frequency',
    question: 'How often do you reach for it?',
    why: 'This shapes how we pace your early days.',
    options: [
      { label: 'A few times a day', patch: { usageFrequency: 'A few times a day' }, echo: "Manageable. We'll walk it down to zero." },
      { label: 'Hourly', patch: { usageFrequency: 'Hourly' }, echo: "Every hour — then we'll be there every hour." },
      { label: 'Constantly', patch: { usageFrequency: 'Constantly' }, echo: 'Heavy. All the more worth putting down.' },
      { label: "I've lost count", patch: { usageFrequency: "I've lost count" }, echo: "That's the honest answer. It's also why this works." },
    ],
  },
  {
    id: 'spend',
    question: 'What do you spend a week?',
    why: 'So we can show you the money coming back.',
    options: [
      { label: '~$20', patch: { weeklySpend: 20, currency: 'USD' }, echo: "Over $1,000 a year. You'll watch it come back." },
      { label: '~$40', patch: { weeklySpend: 40, currency: 'USD' }, echo: "That's $2,000+ a year. It starts returning today." },
      { label: '~$60', patch: { weeklySpend: 60, currency: 'USD' }, echo: '$3,000 a year, headed back your way.' },
      { label: '$80 or more', patch: { weeklySpend: 85, currency: 'USD' }, echo: "$4,400 a year. That money's coming home." },
    ],
  },
  {
    id: 'worst',
    question: 'When are cravings worst?',
    why: 'We surface your craving tool right when you need it.',
    options: [
      { label: 'Mornings', patch: { worstCravingTime: 'Mornings' }, echo: "We'll be there before the coffee is." },
      { label: 'After meals', patch: { worstCravingTime: 'After meals' }, echo: 'The classic trigger. We have a tool for exactly that.' },
      { label: 'Stress', patch: { worstCravingTime: 'Stress' }, echo: "We'll give you something better to reach for." },
      { label: 'Nights', patch: { worstCravingTime: 'Nights' }, echo: 'The quiet hours are the hardest. Noted.' },
    ],
  },
  {
    id: 'feeling',
    question: 'And right now — how does quitting feel?',
    why: "There's no wrong answer.",
    options: [
      { label: 'Scared', patch: { quitFeeling: 'scared' }, echo: 'Good. Scared means it matters.' },
      { label: 'Ready', patch: { quitFeeling: 'ready' }, echo: "Then let's not wait another day." },
      { label: 'Tired of it', patch: { quitFeeling: 'tired' }, echo: 'That exhaustion is fuel. Use it.' },
      { label: 'Not sure', patch: { quitFeeling: 'unsure' }, echo: "You don't need sure. Willing is enough." },
    ],
  },
];

export const quizProgress = (index: number) => 0.1 + index * 0.11;
export const EMPATHY_PROGRESS = 0.82;
export const SOLUTION_PROGRESS = 0.92;

const DURATION_PHRASE: Record<string, string> = {
  'Less than a year': 'Under a year in',
  '1–2 years': 'A couple years in',
  '3–5 years': '3–5 years in',
  '5+ years': 'Five years and counting',
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

export function buildEmpathy(vapingDuration: string, worstCravingTime: string, quitFeeling = '') {
  const durL = DURATION_PHRASE[vapingDuration] ?? 'A while in';
  const worst = worstCravingTime || 'Nights';
  return {
    mirror: `${durL} — and it's ${WORST_LOWER[worst]} that get you.`,
    feeling: FEELING_LINE[quitFeeling] ?? null,
    proof: `**You're not alone.** ${WORST_CAP[worst]} cravings break the most streaks — **we built for exactly that.**`,
  };
}
