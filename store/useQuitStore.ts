/**
 * App state — the single Zustand store (spec §2), persisted to AsyncStorage.
 *
 * Source-of-truth principle (spec §1): everything visible derives from
 * `quitTimestamp` at render time. We never store a running counter here.
 * Premium status is NOT here — it lives in RevenueCat (spec §5), read via usePremium().
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { msClean } from '@/lib/time';

export type Currency = 'USD' | 'GBP' | 'CAD' | 'AUD';
export type Motivation = 'health' | 'money' | 'control' | 'someone';
export type ThemePref = 'light' | 'dark' | 'system';

export type Reason = {
  id: string;
  glyph: string;
  title: string;
  note: string;
};

export type NotificationPrefs = {
  enabled: boolean;
  dailyTime: string; // "HH:mm"
  milestonesOn: boolean;
  streakNudgeOn: boolean;
};

export type SessionSlot = 'morning' | 'midday' | 'evening';

export type SessionPlan = {
  morning: string; // "HH:mm"
  midday: string;
  evening: string;
  enabled: boolean;
  anchor: SessionSlot;
  defaultPattern: string;
};

export type QuitState = {
  // core
  quitTimestamp: number | null; // UTC ms; null until onboarding done
  longestStreakMs: number; // best run ever; survives resets

  // from onboarding quiz
  userName: string | null;
  weeklySpend: number; // user's currency units
  currency: Currency;
  primaryMotivation: Motivation;
  vapingDuration: string; // legacy Q2 answer (question removed)
  usageFrequency: string;
  worstCravingTime: string;
  withoutIt: string; // what happens without it on you
  triedBefore: string; // past quit attempts
  quitFeeling: string; // how quitting feels right now
  reasons: Reason[];
  sessions: SessionPlan;

  // app
  onboardingComplete: boolean;
  themePref: ThemePref; // default 'system'
  notifications: NotificationPrefs;
  breathSound: boolean; // craving 4-7-8 phase-change chime on/off

  // premium (spec premium §3)
  trialStartedAt: number | null; // local 3-day trial start; null = never started
  trialUsed: boolean; // trial can only be taken once
  trialEndSeen: boolean; // paywall re-shown once at trial expiry
  entitledCached: boolean; // last RevenueCat entitlement (never the trial), for headless widget reads

  // bookkeeping
  hasRequestedReview: boolean; // in-app review fired once
};

export type QuitActions = {
  /** WOW moment — mark the user clean now and start the counter. */
  startQuit: () => void;
  /** "I slipped" — keep the record, restart the counter (spec §2 reset logic). */
  slip: () => void;
  setOnboardingComplete: (value: boolean) => void;
  setThemePref: (pref: ThemePref) => void;
  setBreathSound: (value: boolean) => void;
  setReasons: (reasons: Reason[]) => void;
  addReason: (reason: Reason) => void;
  updateReason: (id: string, patch: Partial<Omit<Reason, 'id'>>) => void;
  removeReason: (id: string) => void;
  setNotifications: (patch: Partial<NotificationPrefs>) => void;
  setUserName: (name: string | null) => void;
  setSessions: (patch: Partial<SessionPlan>) => void;
  /** Accept the local 3-day trial (paywall dismiss offer). One-shot. */
  startTrial: () => void;
  setTrialEndSeen: (value: boolean) => void;
  setEntitledCached: (value: boolean) => void;
  markReviewRequested: () => void;
  /** Patch onboarding-quiz answers as they're tapped (spec §4). */
  setQuizAnswers: (patch: Partial<QuitState>) => void;
  /** Settings → "Delete my data": wipe back to defaults. */
  resetAll: () => void;
};

const DEFAULT_STATE: QuitState = {
  quitTimestamp: null,
  longestStreakMs: 0,
  userName: null,
  weeklySpend: 0,
  currency: 'USD',
  primaryMotivation: 'health',
  vapingDuration: '',
  usageFrequency: '',
  worstCravingTime: '',
  withoutIt: '',
  triedBefore: '',
  quitFeeling: '',
  reasons: [],
  sessions: {
    morning: '08:00',
    midday: '13:00',
    evening: '20:00',
    enabled: false,
    anchor: 'evening',
    defaultPattern: 'calm478',
  },
  onboardingComplete: false,
  themePref: 'system',
  breathSound: true,
  trialStartedAt: null,
  trialUsed: false,
  trialEndSeen: false,
  entitledCached: false,
  notifications: {
    enabled: false,
    dailyTime: '09:00',
    milestonesOn: true,
    streakNudgeOn: true,
  },
  hasRequestedReview: false,
};

type Store = QuitState &
  QuitActions & {
    /** Persist-rehydration flag — gate the launch redirect until this is true. */
    _hasHydrated: boolean;
    _setHasHydrated: (value: boolean) => void;
  };

export const useQuitStore = create<Store>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      _hasHydrated: false,
      _setHasHydrated: (value) => set({ _hasHydrated: value }),

      startQuit: () => set({ quitTimestamp: Date.now() }),

      slip: () => {
        const { quitTimestamp, longestStreakMs } = get();
        const current = msClean(quitTimestamp);
        set({
          // Preserve the record first, THEN restart the counter. Never erased.
          longestStreakMs: Math.max(longestStreakMs, current),
          quitTimestamp: Date.now(),
        });
        // Step 7 will reschedule milestone notifications + refresh the widget here.
      },

      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      setThemePref: (themePref) => set({ themePref }),
      setBreathSound: (breathSound) => set({ breathSound }),
      setReasons: (reasons) => set({ reasons }),
      addReason: (reason) => set((s) => ({ reasons: [...s.reasons, reason] })),
      updateReason: (id, patch) =>
        set((s) => ({
          reasons: s.reasons.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeReason: (id) => set((s) => ({ reasons: s.reasons.filter((r) => r.id !== id) })),
      setNotifications: (patch) =>
        set((s) => ({ notifications: { ...s.notifications, ...patch } })),
      setUserName: (userName) => set({ userName }),
      setSessions: (patch) => set((s) => ({ sessions: { ...s.sessions, ...patch } })),
      startTrial: () => {
        if (get().trialUsed) return;
        set({ trialStartedAt: Date.now(), trialUsed: true, trialEndSeen: false });
      },
      setTrialEndSeen: (trialEndSeen) => set({ trialEndSeen }),
      setEntitledCached: (entitledCached) => set({ entitledCached }),
      markReviewRequested: () => set({ hasRequestedReview: true }),
      setQuizAnswers: (patch) => set(patch),
      resetAll: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'clearway-quit-store',
      version: 5,
      migrate: (persisted, version) => {
        let state = persisted as Partial<QuitState> & { premiumCached?: boolean };
        if (version < 2) state = { ...state, reasons: [] };
        if (version < 3)
          state = {
            ...state,
            trialStartedAt: null,
            trialUsed: false,
            trialEndSeen: false,
          };
        if (version < 5) {
          const { premiumCached, ...rest } = state;
          state = { ...rest, entitledCached: false };
        }
        return state;
      },
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist transient flags or the actions.
      partialize: ({ _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
