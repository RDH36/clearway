import { ScrollView, Text, View } from 'react-native';
import { HEALTH_MARKERS } from '@/lib/health';
import { countdownLabel, durationLabel } from '@/lib/format';
import { fonts } from '@/constants/theme';
import { TimelineRow } from './TimelineRow';

export function RecoveryTab({ ms }: { ms: number }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3', paddingTop: 4 }}>
        {"What's healed — and what's next."}
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {HEALTH_MARKERS.map((m, i) => {
          const past = ms >= m.atMs;
          return (
            <TimelineRow key={m.id} state={past ? 'reached' : 'idle'} isLast={i === HEALTH_MARKERS.length - 1} size={30}>
              <View
                style={{
                  gap: 4,
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  backgroundColor: past ? 'rgba(22,40,46,0.72)' : 'rgba(22,40,46,0.4)',
                  borderColor: past ? '#23383E' : 'rgba(35,56,62,0.5)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: past ? '#5BE0C6' : '#8AA1A0', textTransform: 'uppercase' }}>
                    {durationLabel(m.atMs)}
                  </Text>
                  {!past ? (
                    <Text
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 10,
                        letterSpacing: 0.5,
                        color: '#AFC4C2',
                        backgroundColor: 'rgba(150,170,172,0.14)',
                        borderRadius: 20,
                        paddingVertical: 3,
                        paddingHorizontal: 9,
                        overflow: 'hidden',
                      }}
                    >
                      {countdownLabel(m.atMs - ms)}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: past ? '#EAF4F2' : '#AFC4C2' }}>
                  {m.title}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: '#9FB4B3' }}>
                  {m.body}
                </Text>
              </View>
            </TimelineRow>
          );
        })}
      </ScrollView>
    </View>
  );
}
