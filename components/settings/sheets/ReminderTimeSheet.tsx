import { useState } from 'react';
import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore, type SessionSlot } from '@/store/useQuitStore';
import { SLOT_LABEL } from '@/lib/ritual';
import { withAlpha } from '../SettingsGroup';
import { SettingsSheet, SheetButton, Stepper } from '../SettingsSheet';

export function formatTime12(dailyTime: string): string {
  const [h, m] = dailyTime.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function TimeSheet({
  title,
  blurb,
  initial,
  onClose,
  onSave,
  lockPeriod,
  hourOptions,
  maxMinutes,
}: {
  title: string;
  blurb: string;
  initial: string;
  onClose: () => void;
  onSave: (hhmm: string) => void;
  lockPeriod?: 'AM' | 'PM';
  hourOptions?: number[];
  maxMinutes?: number;
}) {
  const { name, colors } = useTheme();
  const [h24, m] = initial.split(':').map(Number);
  const initialHour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hours = hourOptions ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [hour, setHour] = useState(hours.includes(initialHour12) ? initialHour12 : hours[0]);
  const [minute, setMinute] = useState(m - (m % 5));
  const [pm, setPm] = useState(lockPeriod ? lockPeriod === 'PM' : h24 >= 12);

  const stepHour = (dir: -1 | 1) => {
    setHour((v) => {
      const idx = hours.indexOf(v);
      return hours[(idx + dir + hours.length) % hours.length];
    });
  };

  const save = (requestClose: (after?: () => void) => void) => {
    let h = (hour % 12) + (pm ? 12 : 0);
    let min = minute;
    if (maxMinutes != null && h * 60 + min > maxMinutes) {
      h = Math.floor(maxMinutes / 60);
      min = maxMinutes % 60;
    }
    requestClose(() => onSave(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`));
  };

  return (
    <SettingsSheet title={title} onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            {blurb}
          </Text>
          <View style={{ gap: 13 }}>
            <Stepper
              label="Hour"
              value={String(hour)}
              onPrev={() => stepHour(-1)}
              onNext={() => stepHour(1)}
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
                const disabled = lockPeriod != null && lockPeriod !== period;
                return (
                  <PressableScale
                    key={period}
                    onPress={() => {
                      if (disabled) return;
                      setPm(period === 'PM');
                    }}
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

export function ReminderTimeSheet({ onClose }: { onClose: () => void }) {
  const dailyTime = useQuitStore((s) => s.notifications.dailyTime);
  const setNotifications = useQuitStore((s) => s.setNotifications);
  return (
    <TimeSheet
      title="Daily reminder"
      blurb="A gentle check-in, once a day."
      initial={dailyTime}
      onClose={onClose}
      onSave={(dailyTime12) => setNotifications({ dailyTime: dailyTime12 })}
    />
  );
}

const SLOT_RULES: Record<SessionSlot, { lockPeriod: 'AM' | 'PM'; hourOptions?: number[]; maxMinutes?: number }> = {
  morning: { lockPeriod: 'AM' },
  midday: { lockPeriod: 'PM', hourOptions: [12, 1, 2, 3], maxMinutes: 15 * 60 },
  evening: { lockPeriod: 'PM' },
};

export function SessionTimeSheet({ slot, onClose }: { slot: SessionSlot; onClose: () => void }) {
  const time = useQuitStore((s) => s.sessions[slot]);
  const setSessions = useQuitStore((s) => s.setSessions);
  const rules = SLOT_RULES[slot];
  return (
    <TimeSheet
      title={`${SLOT_LABEL[slot]} session`}
      blurb="We nudge you at this time — a session before the pull starts."
      initial={time}
      onClose={onClose}
      onSave={(hhmm) => setSessions({ [slot]: hhmm })}
      lockPeriod={rules.lockPeriod}
      hourOptions={rules.hourOptions}
      maxMinutes={rules.maxMinutes}
    />
  );
}
