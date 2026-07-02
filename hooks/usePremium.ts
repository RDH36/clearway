import { useEffect, useState } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID, purchasesConfigured } from '@/lib/purchases';

export function usePremium() {
  const [info, setInfo] = useState<CustomerInfo | null>(null);

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

  return {
    isPremium: info?.entitlements.active[ENTITLEMENT_ID] != null,
    managementURL: info?.managementURL ?? null,
  };
}
