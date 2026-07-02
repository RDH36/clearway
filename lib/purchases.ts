import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const ANDROID_KEY = 'goog_REPLACE_WITH_PUBLIC_SDK_KEY';
const IOS_KEY = 'appl_REPLACE_WITH_PUBLIC_SDK_KEY';

export const ENTITLEMENT_ID = 'premium';

const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

export const purchasesConfigured = () => !apiKey.includes('REPLACE');

export function initPurchases() {
  if (!purchasesConfigured()) return;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
}
