import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore, type ThemePref } from '@/store/useQuitStore';
import { withAlpha } from './SettingsGroup';

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function AppearanceRow() {
  const { name, colors } = useTheme();
  const themePref = useQuitStore((s) => s.themePref);
  const setThemePref = useQuitStore((s) => s.setThemePref);

  return (
    <View style={{ paddingVertical: 15, paddingHorizontal: 18, gap: 11 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 15.5, color: colors.ink }}>Appearance</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          padding: 4,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: name === 'dark' ? 'rgba(11,24,28,0.6)' : withAlpha(colors.haze, 0.3),
        }}
      >
        {OPTIONS.map(({ value, label }) => {
          const on = themePref === value;
          return (
            <PressableScale
              key={value}
              onPress={() => setThemePref(value)}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? withAlpha(colors.clear, 0.16) : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.bodySemibold,
                  fontSize: 14,
                  color: on ? colors.clear : colors.muted,
                }}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
