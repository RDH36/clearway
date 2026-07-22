import { Linking, Share } from 'react-native';
import * as StoreReview from 'expo-store-review';
import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID, purchasesConfigured } from '@/lib/purchases';
import { haptics } from '@/lib/haptics';

export const PRIVACY_URL = 'https://clearway.app/privacy';
export const TERMS_URL = 'https://clearway.app/terms';

export async function rateApp() {
  if (await StoreReview.isAvailableAsync()) {
    await StoreReview.requestReview();
    return;
  }
  const url = StoreReview.storeUrl();
  if (url) Linking.openURL(url);
}

export async function restorePurchases() {
  if (!purchasesConfigured()) return false;
  try {
    const info = await Purchases.restorePurchases();
    const restored = info.entitlements.active[ENTITLEMENT_ID] != null;
    if (restored) haptics.purchaseSuccess();
    return restored;
  } catch {
    return false;
  }
}

export function shareApp() {
  Share.share({
    message: "I'm clearing the air — quitting vaping with Clearway. One breath at a time.",
  });
}
