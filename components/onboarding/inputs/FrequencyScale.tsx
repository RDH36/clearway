import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';
import type { QuizOption } from '@/components/onboarding/content';

const SHORT: Record<string, string> = {
  'A few times a day': 'A few\na day',
  Hourly: 'Hourly',
  Constantly: 'Constantly',
  "I've lost count": 'Lost\ncount',
};

const DOT_ROW = 46;

export function FrequencyScale({ options, onSelect }: { options: QuizOption[]; onSelect: (option: QuizOption) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 0 }}>
        <View style={{ position: 'absolute', left: '12.5%', right: '12.5%', top: DOT_ROW / 2 - 2, height: 4, borderRadius: 2, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(91,224,198,0.2)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(91,224,198,0.42)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(91,224,198,0.68)' }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {options.map((opt, i) => {
          const size = 22 + i * 7;
          return (
            <PressableScale
              key={opt.label}
              onPress={() => {
                haptics.tap();
                onSelect(opt);
              }}
              style={{ flex: 1, alignItems: 'center', gap: 10 }}
            >
              <View style={{ height: DOT_ROW, justifyContent: 'center' }}>
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: `rgba(91,224,198,${0.16 + i * 0.18})`,
                    borderWidth: 1.5,
                    borderColor: '#5BE0C6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ width: 6 + i * 2, height: 6 + i * 2, borderRadius: 8, backgroundColor: '#5BE0C6' }} />
                </View>
              </View>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, color: '#C7D6D4', textAlign: 'center' }}>
                {SHORT[opt.label] ?? opt.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: '#7E9A9B', textAlign: 'center', paddingTop: 6 }}>
        Tap where you land
      </Text>
    </View>
  );
}
