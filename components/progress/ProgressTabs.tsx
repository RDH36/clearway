import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';

export type ProgressTab = 'milestones' | 'recovery';

const TABS: { key: ProgressTab; label: string }[] = [
  { key: 'milestones', label: 'Milestones' },
  { key: 'recovery', label: 'Recovery' },
];

export function ProgressTabs({ value, onChange }: { value: ProgressTab; onChange: (t: ProgressTab) => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        backgroundColor: 'rgba(11,24,28,0.6)',
        borderWidth: 1,
        borderColor: '#23383E',
        borderRadius: 14,
        padding: 4,
      }}
    >
      {TABS.map((t) => {
        const on = value === t.key;
        return (
          <PressableScale
            key={t.key}
            onPress={() => onChange(t.key)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? 'rgba(91,224,198,0.16)' : 'transparent',
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14, color: on ? '#5BE0C6' : '#9FB4B3' }}>
              {t.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
