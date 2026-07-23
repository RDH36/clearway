import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';
import type { QuizOption } from '@/components/onboarding/content';

const GLYPH: Record<string, string> = {
  Mornings: '☀',
  'After meals': '☕',
  Stress: '⚡',
  Nights: '☾',
};

export function DayTimeline({ options, onSelect }: { options: QuizOption[]; onSelect: (option: QuizOption) => void }) {
  return (
    <View style={{ gap: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: '#7E9A9B' }}>DAWN</Text>
        <View style={{ flex: 1, height: 1.5, backgroundColor: '#1B3238' }} />
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: '#7E9A9B' }}>MIDNIGHT</Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: -1 }}>
        {options.map((opt) => (
          <View key={opt.label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#5BE0C6', marginTop: -5 }} />
            <View style={{ width: 1.5, height: 12, backgroundColor: 'rgba(91,224,198,0.4)' }} />
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((opt) => (
          <PressableScale
            key={opt.label}
            onPress={() => {
              haptics.tap();
              onSelect(opt);
            }}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 7,
              paddingVertical: 15,
              paddingHorizontal: 4,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#23383E',
              backgroundColor: 'rgba(22,40,46,0.72)',
            }}
          >
            <Text style={{ fontSize: 20, color: '#5BE0C6' }}>{GLYPH[opt.label] ?? '·'}</Text>
            <Text
              numberOfLines={2}
              style={{ fontFamily: fonts.bodySemibold, fontSize: 12.5, lineHeight: 16, color: '#EAF4F2', textAlign: 'center' }}
            >
              {opt.label}
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: 'rgba(91,224,198,0.12)',
              }}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1, color: '#5BE0C6', textTransform: 'uppercase' }}>
                {opt.sub}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}
