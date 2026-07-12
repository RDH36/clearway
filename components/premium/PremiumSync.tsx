import { useEffect } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { useQuitStore } from '@/store/useQuitStore';
import { initNotifications, syncEncouragementSchedule } from '@/lib/notifications';
import { refreshWidget } from '@/components/widget/refresh';

export function PremiumSync() {
  const { isPremium } = usePremium();
  const quitTimestamp = useQuitStore((s) => s.quitTimestamp);
  const weeklySpend = useQuitStore((s) => s.weeklySpend);
  const primaryMotivation = useQuitStore((s) => s.primaryMotivation);
  const reasons = useQuitStore((s) => s.reasons);
  const notifications = useQuitStore((s) => s.notifications);

  useEffect(() => {
    initNotifications();
  }, []);

  useEffect(() => {
    syncEncouragementSchedule(
      { quitTimestamp, weeklySpend, primaryMotivation, reasons, notifications },
      isPremium
    );
    refreshWidget();
  }, [isPremium, quitTimestamp, weeklySpend, primaryMotivation, reasons, notifications]);

  return null;
}
