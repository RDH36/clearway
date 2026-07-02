import { Linking, Share } from 'react-native';
import * as StoreReview from 'expo-store-review';

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

export function sendFeedback() {
  Linking.openURL('mailto:hello@clearway.app?subject=Clearway%20feedback');
}

export function shareApp() {
  Share.share({
    message: "I'm clearing the air — quitting vaping with Clearway. One breath at a time.",
  });
}
