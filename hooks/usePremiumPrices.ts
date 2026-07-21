import { useEffect, useState } from 'react';
import { getPremiumPackages, packageForPlan, type Plan } from '@/lib/purchases';

const SUFFIX: Record<Plan, string> = {
  annual: ' / year',
  monthly: ' / month',
  lifetime: ' once · clear forever',
};

const ALL_PLANS: Plan[] = ['annual', 'monthly', 'lifetime'];

export function usePremiumPrices() {
  const [prices, setPrices] = useState<Partial<Record<Plan, string>>>({});

  useEffect(() => {
    let alive = true;
    getPremiumPackages().then((packages) => {
      if (!alive) return;
      const next: Partial<Record<Plan, string>> = {};
      for (const plan of ALL_PLANS) {
        const pkg = packageForPlan(packages, plan);
        if (pkg) next[plan] = pkg.product.priceString + SUFFIX[plan];
      }
      setPrices(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return prices;
}
