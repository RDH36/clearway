/**
 * Home header — settings (left) + progress (right). 44x44 icon buttons; press
 * spring + global haptic come from pressto. Red-zone OK (non-primary actions).
 */
import { View, type ViewStyle } from 'react-native';
import { PressableScale } from 'pressto';
import { darkColors } from '@/constants/theme';
import { ProgressIcon, SettingsIcon } from './icons';

const BTN: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: '#23383E',
  backgroundColor: 'rgba(22,40,46,0.5)',
  alignItems: 'center',
  justifyContent: 'center',
};

export function HomeHeader({
  onSettings,
  onProgress,
}: {
  onSettings: () => void;
  onProgress: () => void;
}) {
  // Home is dark-locked (atmosphere screen) — always the dark theme's primary text,
  // never the system theme, so icons stay bright on the dark atmosphere in any mode.
  return (
    <View style={{ height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <PressableScale onPress={onSettings} style={BTN}>
        <SettingsIcon color={darkColors.ink} />
      </PressableScale>
      <PressableScale onPress={onProgress} style={BTN}>
        <ProgressIcon color={darkColors.ink} />
      </PressableScale>
    </View>
  );
}
