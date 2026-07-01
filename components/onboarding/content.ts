import type { QuitState } from '@/store/useQuitStore';

export const CLARITY_HAZE = 0.12;
export const CLARITY_CLEAR = 0.52;

export type QuizOption = {
  label: string;
  patch: Partial<QuitState>;
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
      { label: 'Health', patch: { primaryMotivation: 'health' } },
      { label: 'Money', patch: { primaryMotivation: 'money' } },
      { label: 'Control', patch: { primaryMotivation: 'control' } },
      { label: 'Someone I care about', patch: { primaryMotivation: 'someone' } },
    ],
  },
  {
    id: 'duration',
    question: 'How long have you been vaping?',
    why: 'We tailor the timeline to your history.',
    options: [
      { label: 'Less than a year', patch: { vapingDuration: 'Less than a year' } },
      { label: '1–2 years', patch: { vapingDuration: '1–2 years' } },
      { label: '3–5 years', patch: { vapingDuration: '3–5 years' } },
      { label: '5+ years', patch: { vapingDuration: '5+ years' } },
    ],
  },
  {
    id: 'frequency',
    question: 'How often do you reach for it?',
    why: 'This shapes how we pace your early days.',
    options: [
      { label: 'A few times a day', patch: { usageFrequency: 'A few times a day' } },
      { label: 'Hourly', patch: { usageFrequency: 'Hourly' } },
      { label: 'Constantly', patch: { usageFrequency: 'Constantly' } },
      { label: "I've lost count", patch: { usageFrequency: "I've lost count" } },
    ],
  },
  {
    id: 'spend',
    question: 'What do you spend a week?',
    why: 'So we can show you the money coming back.',
    options: [
      { label: '~$20', patch: { weeklySpend: 20, currency: 'USD' } },
      { label: '~$40', patch: { weeklySpend: 40, currency: 'USD' } },
      { label: '~$60', patch: { weeklySpend: 60, currency: 'USD' } },
      { label: '$80 or more', patch: { weeklySpend: 85, currency: 'USD' } },
    ],
  },
  {
    id: 'worst',
    question: 'When are cravings worst?',
    why: 'We surface your craving tool right when you need it.',
    options: [
      { label: 'Mornings', patch: { worstCravingTime: 'Mornings' } },
      { label: 'After meals', patch: { worstCravingTime: 'After meals' } },
      { label: 'Stress', patch: { worstCravingTime: 'Stress' } },
      { label: 'Nights', patch: { worstCravingTime: 'Nights' } },
    ],
  },
];

export const quizProgress = (index: number) => 0.1 + index * 0.13;
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

export function buildEmpathy(vapingDuration: string, worstCravingTime: string) {
  const durL = DURATION_PHRASE[vapingDuration] ?? 'A while in';
  const worst = worstCravingTime || 'Nights';
  return {
    mirror: `${durL} — and it's ${WORST_LOWER[worst]} that get you.`,
    proof: `You're not alone. Most people who quit have tried before, and ${WORST_CAP[worst]} cravings are the #1 reason streaks break.`,
  };
}
