/**
 * Screen container — themed base background + safe-area insets + screen padding
 * (24px, design brief §3). Every route renders inside one of these.
 */
import { type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  /** Apply the standard 24px horizontal padding. */
  padded?: boolean;
  className?: string;
};

export function Screen({ children, padded = true, className = '' }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 bg-base ${padded ? 'px-screen' : ''} ${className}`}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
