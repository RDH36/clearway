import { useState } from 'react';
import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore } from '@/store/useQuitStore';
import { withAlpha } from '../SettingsGroup';
import { SettingsSheet, SheetButton, Stepper } from '../SettingsSheet';

export function formatTime12(dailyTime: string): string {
  const [h, m] = dailyTime.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function ReminderTimeSheet({ onClose }: { onClose: () => void }) {
  const { name, colors } = useTheme();
  const dailyTime = useQuitStore((s) => s.notifications.dailyTime);
  const setNotifications = useQuitStore((s) => s.setNotifications);

  const [h24, m] = dailyTime.split(':').map(Number);
  const [hour, setHour] = useState(h24 % 12 === 0 ? 12 : h24 % 12);
  const [minute, setMinute] = useState(m - (m % 5));
  const [pm, setPm] = useState(h24 >= 12);

  const save = (requestClose: (after?: () => void) => void) => {
    const h = (hour % 12) + (pm ? 12 : 0);
    requestClose(() =>
      setNotifications({ dailyTime: `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}` })
    );
  };

  return (
    <SettingsSheet title="Daily reminder" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            A gentle check-in, once a day.
          </Text>
          <View style={{ gap: 13 }}>
            <Stepper
              label="Hour"
              value={String(hour)}
              onPrev={() => setHour((v) => (v === 1 ? 12 : v - 1))}
              onNext={() => setHour((v) => (v === 12 ? 1 : v + 1))}
            />
            <Stepper
              label="Minutes"
              value={String(minute).padStart(2, '0')}
              onPrev={() => setMinute((v) => (v - 5 + 60) % 60)}
              onNext={() => setMinute((v) => (v + 5) % 60)}
            />
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
              {(['AM', 'PM'] as const).map((period) => {
                const on = pm === (period === 'PM');
                return (
                  <PressableScale
                    key={period}
                    onPress={() => setPm(period === 'PM')}
                    style={{
                      flex: 1,
                      height: 36,
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
                      {period}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <SheetButton label="Save" onPress={() => save(requestClose)} />
            <SheetButton label="Cancel" variant="ghost" onPress={() => requestClose()} />
          </View>
        </View>
      )}
    </SettingsSheet>
  );
}
