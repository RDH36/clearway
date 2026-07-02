import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore, type Currency } from '@/store/useQuitStore';
import { withAlpha } from '../SettingsGroup';
import { SettingsSheet, SheetButton } from '../SettingsSheet';

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: '$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

const QUICK_AMOUNTS = [20, 40, 60, 85];

const FREQUENCIES = ['A few times a day', 'Hourly', 'Constantly', "I've lost count"];

export function WeeklyCostSheet({ onClose }: { onClose: () => void }) {
  const { name, colors } = useTheme();
  const weeklySpend = useQuitStore((s) => s.weeklySpend);
  const currency = useQuitStore((s) => s.currency);
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);
  const [text, setText] = useState(weeklySpend > 0 ? String(weeklySpend) : '');

  const symbol = CURRENCY_SYMBOL[currency];
  const parsed = Math.max(0, Math.round(Number(text.replace(/[^0-9.]/g, '')) || 0));

  return (
    <SettingsSheet title="Weekly cost" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            What vaping used to cost you each week.
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 13,
              paddingHorizontal: 14,
              backgroundColor: name === 'dark' ? 'rgba(11,24,28,0.6)' : withAlpha(colors.haze, 0.2),
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.muted }}>{symbol}</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              keyboardType="number-pad"
              placeholder="40"
              placeholderTextColor={withAlpha(colors.muted, 0.6)}
              maxLength={5}
              style={{ flex: 1, paddingVertical: 12, fontFamily: fonts.body, fontSize: 16, color: colors.ink }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            {QUICK_AMOUNTS.map((amount) => {
              const on = parsed === amount;
              return (
                <PressableScale
                  key={amount}
                  onPress={() => setText(String(amount))}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 13,
                    borderWidth: 1,
                    borderColor: on ? colors.clear : colors.line,
                    backgroundColor: on ? withAlpha(colors.clear, 0.14) : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14, color: on ? colors.clear : colors.muted }}>
                    {symbol}
                    {amount}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          <View style={{ gap: 10 }}>
            <SheetButton label="Save" onPress={() => requestClose(() => setQuizAnswers({ weeklySpend: parsed }))} />
            <SheetButton label="Cancel" variant="ghost" onPress={() => requestClose()} />
          </View>
        </View>
      )}
    </SettingsSheet>
  );
}

export function FrequencySheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const usageFrequency = useQuitStore((s) => s.usageFrequency);
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);

  return (
    <SettingsSheet title="Frequency" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            How often you used to reach for it.
          </Text>
          <View style={{ gap: 9 }}>
            {FREQUENCIES.map((label) => {
              const on = usageFrequency === label;
              return (
                <PressableScale
                  key={label}
                  onPress={() => requestClose(() => setQuizAnswers({ usageFrequency: label }))}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: on ? colors.clear : colors.line,
                    backgroundColor: on ? withAlpha(colors.clear, 0.12) : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: on ? fonts.bodySemibold : fonts.body,
                      fontSize: 15,
                      color: on ? colors.clear : colors.ink,
                    }}
                  >
                    {label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          <SheetButton label="Cancel" variant="ghost" onPress={() => requestClose()} />
        </View>
      )}
    </SettingsSheet>
  );
}
