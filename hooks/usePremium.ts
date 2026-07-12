import { useEffect, useState } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID, purchasesConfigured } from '@/lib/purchases';
import { useQuitStore } from '@/store/useQuitStore';
import { DAY_MS, MINUTE_MS } from '@/constants/time';

export const TRIAL_MS = 3 * DAY_MS;

export function trialRemainingMs(trialStartedAt: number | null, now: number): number {
  if (trialStartedAt == null) return 0;
  return Math.max(0, trialStartedAt + TRIAL_MS - now);
}

const nowMs = () => Date.now();

export function usePremium() {
  const trialStartedAt = useQuitStore((s) => s.trialStartedAt);
  const trialUsed = useQuitStore((s) => s.trialUsed);
  const premiumCached = useQuitStore((s) => s.premiumCached);
  const setPremiumCached = useQuitStore((s) => s.setPremiumCached);

  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [now, setNow] = useState(nowMs);

  useEffect(() => {
    if (!purchasesConfigured()) return;
    let mounted = true;
    Purchases.getCustomerInfo()
      .then((next) => {
        if (mounted) setInfo(next);
      })
      .catch(() => {});
    const listener = (next: CustomerInfo) => setInfo(next);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const remaining = trialRemainingMs(trialStartedAt, now);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setNow(nowMs()), MINUTE_MS);
    return () => clearInterval(id);
  }, [remaining]);

  const entitled = info?.entitlements.active[ENTITLEMENT_ID] != null;
  const trialActive = remaining > 0;
  const isPremium = entitled || trialActive;

  useEffect(() => {
    if (premiumCached !== isPremium) setPremiumCached(isPremium);
  }, [isPremium, premiumCached, setPremiumCached]);

  return {
    isPremium,
    entitled,
    trialActive,
    trialUsed,
    trialDaysLeft: Math.ceil(remaining / DAY_MS),
    trialExpired: trialUsed && trialStartedAt != null && !trialActive,
    managementURL: info?.managementURL ?? null,
  };
}
