import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type PurchasesPackage } from 'react-native-purchases';

const ANDROID_KEY = 'goog_nLCyIZXWEGUvYiMZdZcvCXGLOfs';
const IOS_KEY = 'appl_REPLACE_WITH_PUBLIC_SDK_KEY';

export const ENTITLEMENT_ID = 'premium';

export type Plan = 'annual' | 'monthly' | 'lifetime';

const PLAN_TO_PACKAGE: Record<Plan, string> = {
  annual: '$rc_annual',
  monthly: '$rc_monthly',
  lifetime: '$rc_lifetime',
};

const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

export const purchasesConfigured = () => !apiKey.includes('REPLACE');

export function initPurchases() {
  if (!purchasesConfigured()) return;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
}

export async function getPremiumPackages(): Promise<PurchasesPackage[]> {
  if (!purchasesConfigured()) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

export function packageForPlan(packages: PurchasesPackage[], plan: Plan) {
  return packages.find((p) => p.identifier === PLAN_TO_PACKAGE[plan]) ?? null;
}

export async function purchasePlan(plan: Plan): Promise<{ entitled: boolean; cancelled: boolean }> {
  if (!purchasesConfigured()) return { entitled: false, cancelled: false };
  const pkg = packageForPlan(await getPremiumPackages(), plan);
  if (!pkg) return { entitled: false, cancelled: false };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { entitled: customerInfo.entitlements.active[ENTITLEMENT_ID] != null, cancelled: false };
  } catch (e) {
    return { entitled: false, cancelled: (e as { userCancelled?: boolean })?.userCancelled === true };
  }
}
