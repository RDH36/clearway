import { useEffect, useState } from 'react';
import { getPremiumPackages, packageForPlan, packageHasTrial, type Plan } from '@/lib/purchases';

const SUFFIX: Record<Plan, string> = {
  annual: ' / year',
  monthly: ' / month',
  lifetime: ' once · clear forever',
};

const ALL_PLANS: Plan[] = ['annual', 'monthly', 'lifetime'];

export function usePremiumPrices() {
  const [prices, setPrices] = useState<Partial<Record<Plan, string>>>({});
  const [trials, setTrials] = useState<Partial<Record<Plan, boolean>>>({});

  useEffect(() => {
    let alive = true;
    getPremiumPackages().then((packages) => {
      if (!alive) return;
      const nextPrices: Partial<Record<Plan, string>> = {};
      const nextTrials: Partial<Record<Plan, boolean>> = {};
      for (const plan of ALL_PLANS) {
        const pkg = packageForPlan(packages, plan);
        if (!pkg) continue;
        nextPrices[plan] = pkg.product.priceString + SUFFIX[plan];
        nextTrials[plan] = packageHasTrial(pkg);
      }
      setPrices(nextPrices);
      setTrials(nextTrials);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { prices, trials };
}
