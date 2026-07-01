/**
 * Primary action button. Built on pressto's PressableScale, so the spring
 * press-state + the global pulsar tick (wired in AppProviders) apply automatically
 * — no raw Touchable anywhere (spec §0b.1).
 *
 * Colors come from useTheme() as hex (inline style) rather than NativeWind classes,
 * because the underlying gesture-handler button isn't a NativeWind-interop target.
 * ≥52dp tall, full-width — thumb-zone friendly (design brief §7).
 */
import { View } from 'react-native';
import { PressableScale } from 'pressto';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';
import { layout } from '@/constants/theme';

type Variant = 'primary' | 'secondary';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  pill?: boolean;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  pill = false,
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={{
        minHeight: 52,
        borderRadius: pill ? 999 : layout.radius.button,
        backgroundColor: isPrimary ? colors.clear : colors.surface,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: colors.line,
        opacity: disabled ? 0.4 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
    >
      <View>
        <Text
          variant="body"
          className="font-body-semibold"
          style={{ color: isPrimary ? '#0C4A3E' : colors.ink }}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}
