import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { displayTime } from '@/lib/sessionPlan';
import type { SessionSlot } from '@/store/useQuitStore';

const SLOT_LABEL: Record<SessionSlot, string> = {
  morning: 'Morning',
  midday: 'Midday',
  evening: 'Evening',
};

function Chevron({ dir, onPress }: { dir: -1 | 1; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#23383E',
        backgroundColor: 'rgba(11,24,28,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#9FB4B3', fontSize: 15, marginTop: -1 }}>{dir === -1 ? '−' : '+'}</Text>
    </PressableScale>
  );
}

export function SessionTimes({
  times,
  anchor,
  onShift,
}: {
  times: Record<SessionSlot, string>;
  anchor: SessionSlot;
  onShift: (slot: SessionSlot, minutes: number) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {(['morning', 'midday', 'evening'] as const).map((slot) => (
        <View
          key={slot}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: anchor === slot ? 'rgba(91,224,198,0.4)' : '#23383E',
            backgroundColor: anchor === slot ? 'rgba(91,224,198,0.09)' : 'rgba(22,40,46,0.72)',
            paddingVertical: 12,
            paddingHorizontal: 15,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 9.5,
                letterSpacing: 1.5,
                color: anchor === slot ? '#5BE0C6' : '#7E9A9B',
                textTransform: 'uppercase',
              }}
            >
              {SLOT_LABEL[slot]}
              {anchor === slot ? '  ·  your anchor' : ''}
            </Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 21, color: '#EAF4F2', letterSpacing: -0.3 }}>
              {displayTime(times[slot])}
            </Text>
          </View>
          <Chevron dir={-1} onPress={() => onShift(slot, -30)} />
          <Chevron dir={1} onPress={() => onShift(slot, 30)} />
        </View>
      ))}
    </View>
  );
}
