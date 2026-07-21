import { useEffect, useState } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID, purchasesConfigured } from '@/lib/purchases';
import { trialRemainingMs } from '@/lib/premium';
import { useQuitStore } from '@/store/useQuitStore';
import { DAY_MS, MINUTE_MS } from '@/constants/time';

const nowMs = () => Date.now();

export function usePremium() {
  const trialStartedAt = useQuitStore((s) => s.trialStartedAt);
  const trialUsed = useQuitStore((s) => s.trialUsed);
  const entitledCached = useQuitStore((s) => s.entitledCached);
  const setEntitledCached = useQuitStore((s) => s.setEntitledCached);

  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [now, setNow] = useState(nowMs);

  useEffect(() => {
    if (!purchasesConfigured()) return;
    let mounted = true;
    Purchases.getCustomerInfo()
      .then((next) => {
        if (mounted) {
          setInfo(next);
          setInfoLoaded(true);
        }
      })
      .catch(() => {});
    const listener = (next: CustomerInfo) => {
      setInfo(next);
      setInfoLoaded(true);
    };
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
  const entitlementResolved = !purchasesConfigured() || infoLoaded;

  useEffect(() => {
    if (entitledCached === entitled) return;
    if (!entitled && !entitlementResolved) return;
    setEntitledCached(entitled);
  }, [entitled, entitledCached, entitlementResolved, setEntitledCached]);

  return {
    isPremium,
    entitled,
    entitlement: info?.entitlements.active[ENTITLEMENT_ID] ?? null,
    trialActive,
    trialUsed,
    trialDaysLeft: Math.ceil(remaining / DAY_MS),
    trialExpired: trialUsed && trialStartedAt != null && !trialActive,
    managementURL: info?.managementURL ?? null,
  };
}
