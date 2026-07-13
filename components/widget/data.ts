import AsyncStorage from '@react-native-async-storage/async-storage';
import { msClean } from '@/lib/time';
import { moneySaved } from '@/lib/money';
import { formatMoney, remainingText } from '@/lib/format';
import { progress } from '@/lib/milestones';
import { unlocked } from '@/lib/health';
import { pickAffirmation, reasonLabel } from '@/lib/affirmations';
import { DAY_MS, HOUR_MS } from '@/constants/time';
import type { Motivation } from '@/store/useQuitStore';

export type WidgetPhase = 'why' | 'live' | 'expired';

export type WidgetData = {
  phase: WidgetPhase;
  days: number;
  daysLabel: string;
  money: string;
  nextLabel: string;
  nextRemaining: string;
  nextPct: number;
  healthTitle: string;
  reason: string;
  affirmation: string;
};

const TRIAL_MS = 3 * DAY_MS;

const FALLBACK: WidgetData = {
  phase: 'why',
  days: 0,
  daysLabel: 'days clear',
  money: '$0',
  nextLabel: '',
  nextRemaining: '',
  nextPct: 0,
  healthTitle: '',
  reason: 'Breathing easy again',
  affirmation: 'The air clears from here. One breath at a time.',
};

export async function buildWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem('clearway-quit-store');
    const state = raw ? JSON.parse(raw)?.state : null;
    if (!state) return FALLBACK;

    const motivation: Motivation = state.primaryMotivation ?? 'health';
    const reason = reasonLabel(state.reasons?.[0]?.title, motivation);
    const ms = msClean(state.quitTimestamp ?? null);
    const days = Math.floor(ms / DAY_MS);
    const supportText = pickAffirmation({
      motivation,
      moment: 'general',
      seed: Math.floor(Date.now() / HOUR_MS),
      reason,
      days: Math.max(1, days),
      money: formatMoney(moneySaved(state.weeklySpend ?? 0, Math.max(ms, DAY_MS))),
    }).text;

    if (state.quitTimestamp == null || days < 1) {
      return { ...FALLBACK, reason, affirmation: supportText };
    }

    const trialActive =
      state.trialStartedAt != null && Date.now() - state.trialStartedAt < TRIAL_MS;
    const premium =
      Boolean(state.premiumCached) || trialActive || !state.onboardingComplete;
    if (!premium) return { ...FALLBACK, phase: 'expired', reason, affirmation: supportText };

    const p = progress(ms);
    const reached = unlocked(ms);
    return {
      phase: 'live',
      days,
      daysLabel: days === 1 ? 'day clear' : 'days clear',
      money: formatMoney(moneySaved(state.weeklySpend ?? 0, ms)),
      nextLabel: p.next?.label ?? 'All clear',
      nextRemaining: p.next ? remainingText(p.remainingMs) : 'every milestone reached',
      nextPct: p.pct,
      healthTitle: reached.length > 0 ? reached[reached.length - 1].title : 'Recovery begins now',
      reason,
      affirmation: supportText,
    };
  } catch {
    return FALLBACK;
  }
}
