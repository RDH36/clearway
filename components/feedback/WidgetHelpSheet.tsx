import { Text, View } from 'react-native';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { SettingsSheet, SheetButton } from '@/components/settings/SettingsSheet';

const STEPS = [
  'Long-press an empty spot on your home screen',
  'Tap “Widgets”',
  'Find Clearway and drag it anywhere',
];

export function WidgetHelpSheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <SettingsSheet title="Add it in 10 seconds" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.muted }}>
            Your phone blocked the quick-add dialog — some launchers do. The manual way always works:
          </Text>
          <View style={{ gap: 10 }}>
            {STEPS.map((step, i) => (
              <View key={step} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(91,224,198,0.14)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: '#5BE0C6' }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.ink }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.muted }}>
            On Xiaomi, you can also allow “Home screen shortcuts” in Settings → Apps → Clearway → Other permissions —
            then the button above adds it instantly.
          </Text>
          <SheetButton label="Got it" onPress={() => requestClose()} />
        </View>
      )}
    </SettingsSheet>
  );
}
