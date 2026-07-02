import type { Motivation, Reason } from '@/store/useQuitStore';
import { projectedYear } from '@/lib/money';

export function seedReason(motivation: Motivation, weeklySpend: number): Reason {
  switch (motivation) {
    case 'money':
      return {
        id: 'seed-money',
        glyph: '$',
        title: 'For the money',
        note: `About $${projectedYear(weeklySpend).toLocaleString('en-US')} a year. That's a trip — not a habit.`,
      };
    case 'control':
      return {
        id: 'seed-control',
        glyph: '◎',
        title: 'To take back control',
        note: 'I hate that a small device decides how my day goes.',
      };
    case 'someone':
      return {
        id: 'seed-someone',
        glyph: '♡',
        title: 'For the people I love',
        note: 'I want to be around, clear-headed, for a long time.',
      };
    default:
      return {
        id: 'seed-health',
        glyph: '✚',
        title: 'For my health',
        note: 'I want to climb stairs and run without losing my breath.',
      };
  }
}
