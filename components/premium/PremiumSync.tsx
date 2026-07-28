import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { usePremium } from '@/hooks/usePremium';
import { useQuitStore } from '@/store/useQuitStore';
import { initNotifications, syncEncouragementSchedule } from '@/lib/notifications';
import { syncRitualSchedule } from '@/lib/ritual';
import { cleanupSupportBar } from '@/lib/supportBar';
import { posthog } from '@/lib/analytics';
import { refreshWidget } from '@/components/widget/refresh';

export function PremiumSync() {
  const { isPremium } = usePremium();
  const quitTimestamp = useQuitStore((s) => s.quitTimestamp);
  const weeklySpend = useQuitStore((s) => s.weeklySpend);
  const primaryMotivation = useQuitStore((s) => s.primaryMotivation);
  const reasons = useQuitStore((s) => s.reasons);
  const notifications = useQuitStore((s) => s.notifications);
  const userName = useQuitStore((s) => s.userName);
  const sessions = useQuitStore((s) => s.sessions);

  const premiumRef = useRef(isPremium);
  useEffect(() => {
    premiumRef.current = isPremium;
  }, [isPremium]);

  useEffect(() => {
    initNotifications();
    cleanupSupportBar();
  }, []);

  // MIUI freezes the process right after backgrounding, which can strand an
  // in-flight notification reschedule — reconcile every time we come back.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      const s = useQuitStore.getState();
      const shared = {
        quitTimestamp: s.quitTimestamp,
        weeklySpend: s.weeklySpend,
        primaryMotivation: s.primaryMotivation,
        reasons: s.reasons,
        notifications: s.notifications,
        userName: s.userName,
      };
      syncEncouragementSchedule(shared, premiumRef.current);
      syncRitualSchedule({ ...shared, sessions: s.sessions }, premiumRef.current);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    posthog.register({ premium: isPremium });
    syncEncouragementSchedule(
      { quitTimestamp, weeklySpend, primaryMotivation, reasons, notifications, userName },
      isPremium
    );
    syncRitualSchedule({ sessions, notifications, userName, primaryMotivation, reasons, weeklySpend, quitTimestamp }, isPremium);
    refreshWidget();
  }, [isPremium, quitTimestamp, weeklySpend, primaryMotivation, reasons, notifications, userName, sessions]);

  return null;
}
