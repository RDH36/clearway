import { useState } from 'react';
import { Text, View } from 'react-native';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore } from '@/store/useQuitStore';
import { SettingsSheet, SheetButton, Stepper } from '../SettingsSheet';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const initQuitDate = (ts: number | null) => new Date(ts ?? Date.now());

const currentYear = () => new Date().getFullYear();

const clampedTimestamp = (year: number, month: number, day: number, initial: Date) => {
  const picked = new Date(year, month, day, initial.getHours(), initial.getMinutes());
  return Math.min(picked.getTime(), Date.now());
};

export function QuitDateSheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const quitTimestamp = useQuitStore((s) => s.quitTimestamp);
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);

  const [initial] = useState(() => initQuitDate(quitTimestamp));
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());

  const [thisYear] = useState(currentYear);
  const cycle = (value: number, delta: number, size: number) => (value + delta + size) % size;

  const setSafeDay = (y: number, m: number, d: number) => Math.min(d, daysInMonth(y, m));

  const save = (requestClose: (after?: () => void) => void) => {
    const ts = clampedTimestamp(year, month, setSafeDay(year, month, day), initial);
    requestClose(() => setQuizAnswers({ quitTimestamp: ts }));
  };

  return (
    <SettingsSheet title="Quit date" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            The day you put it down. Your streak counts from here.
          </Text>
          <View style={{ gap: 13 }}>
            <Stepper
              label="Month"
              value={MONTHS[month]}
              onPrev={() => {
                const m = cycle(month, -1, 12);
                setMonth(m);
                setDay((d) => setSafeDay(year, m, d));
              }}
              onNext={() => {
                const m = cycle(month, 1, 12);
                setMonth(m);
                setDay((d) => setSafeDay(year, m, d));
              }}
            />
            <Stepper
              label="Day"
              value={String(day)}
              onPrev={() => setDay((d) => cycle(d - 1, -1, daysInMonth(year, month)) + 1)}
              onNext={() => setDay((d) => cycle(d - 1, 1, daysInMonth(year, month)) + 1)}
            />
            <Stepper
              label="Year"
              value={String(year)}
              onPrev={() => setYear((y) => Math.max(thisYear - 6, y - 1))}
              onNext={() => setYear((y) => Math.min(thisYear, y + 1))}
            />
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
