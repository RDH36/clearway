import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

type WidgetPinNative = {
  isPinSupported: () => boolean;
  requestPin: (providerClassName: string) => boolean;
  pinnedCount: () => number;
};

const native = Platform.OS === 'android' ? requireOptionalNativeModule<WidgetPinNative>('WidgetPin') : null;

const PROVIDER = 'com.rdh36.clearway.widget.Clearway';

export function isWidgetPinSupported(): boolean {
  try {
    return native?.isPinSupported() ?? false;
  } catch {
    return false;
  }
}

export function requestPinClearwayWidget(): boolean {
  try {
    return native?.requestPin(PROVIDER) ?? false;
  } catch {
    return false;
  }
}

export function pinnedWidgetCount(): number {
  try {
    return native?.pinnedCount() ?? 0;
  } catch {
    return 0;
  }
}
