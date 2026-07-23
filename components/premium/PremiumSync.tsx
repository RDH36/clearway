import { useEffect } from 'react';
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

  useEffect(() => {
    initNotifications();
    cleanupSupportBar();
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
