import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { StaggerIn } from '@/components/ui/StaggerIn';
import { HEALTH_MARKERS } from '@/lib/health';
import { countdownLabel, durationLabel } from '@/lib/format';
import { fonts } from '@/constants/theme';
import { TimelineRow } from './TimelineRow';
import { PremiumPill } from './PremiumPill';

export function RecoveryTab({
  ms,
  visible = true,
  isPremium = false,
  onLockedPress,
}: {
  ms: number;
  visible?: boolean;
  isPremium?: boolean;
  onLockedPress?: () => void;
}) {
  const [rowsReady, setRowsReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRowsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <StaggerIn index={0} base={30} duration={240} play={visible}>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3', paddingTop: 4 }}>
          {"What's healed — and what's next."}
        </Text>
      </StaggerIn>

      {!rowsReady ? (
        <View style={{ flex: 1 }} />
      ) : (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {HEALTH_MARKERS.map((m, i) => {
          const past = ms >= m.atMs;
          const locked = m.premiumLocked && !isPremium && !past;
          const card = (
            <View
              style={{
                gap: 4,
                paddingVertical: 13,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                backgroundColor: locked ? 'rgba(150,170,172,0.09)' : past ? 'rgba(22,40,46,0.72)' : 'rgba(22,40,46,0.4)',
                borderColor: locked ? 'rgba(150,170,172,0.16)' : past ? '#23383E' : 'rgba(35,56,62,0.5)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: past ? '#5BE0C6' : '#8AA1A0', textTransform: 'uppercase' }}>
                  {durationLabel(m.atMs)}
                </Text>
                {locked ? (
                  <PremiumPill />
                ) : !past ? (
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
                {locked ? 'Air not yet cleared' : m.body}
              </Text>
            </View>
          );
          return (
            <StaggerIn key={m.id} index={i + 1} base={30} step={30} duration={240} play={visible}>
            <TimelineRow state={locked ? 'locked' : past ? 'reached' : 'idle'} isLast={i === HEALTH_MARKERS.length - 1} size={30}>
              {locked && onLockedPress ? <PressableScale onPress={onLockedPress}>{card}</PressableScale> : card}
            </TimelineRow>
            </StaggerIn>
          );
        })}
      </ScrollView>
      )}
    </View>
  );
}
