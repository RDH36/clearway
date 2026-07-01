/**
 * Stats row — money saved (left) + next-milestone ring (right, taps to Progress).
 * Both pull from the Step 2 core-logic modules. Press spring + haptic via pressto.
 */
import { Text, View, type ViewStyle } from 'react-native';
import { PressableScale } from 'pressto';
import Svg, { Circle } from 'react-native-svg';
import { fonts } from '@/constants/theme';

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

const CARD: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(22,40,46,0.72)',
  borderWidth: 1,
  borderColor: '#23383E',
  borderRadius: 20,
};

const labelStyle = { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' } as const;

export function StatsRow({
  money,
  clearedPct,
  onProgress,
}: {
  money: string;
  clearedPct: number;
  onProgress: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={[CARD, { padding: 16, gap: 3 }]}>
        <Text style={labelStyle}>Saved</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, color: '#EAF4F2', letterSpacing: -0.5 }}>{money}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#7E9A9B' }}>back in your pocket</Text>
      </View>

      <PressableScale onPress={onProgress} style={[CARD, { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <Svg width={50} height={50} viewBox="0 0 54 54">
          <Circle cx="27" cy="27" r={RING_R} fill="none" stroke="#23383E" strokeWidth={4} />
          <Circle
            cx="27"
            cy="27"
            r={RING_R}
            fill="none"
            stroke="#5BE0C6"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - Math.max(0, Math.min(1, clearedPct / 100)))}
            transform="rotate(-90 27 27)"
          />
        </Svg>
        <View style={{ flex: 1, gap: 1, minWidth: 0 }}>
          <Text style={labelStyle}>Air cleared</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: '#EAF4F2', letterSpacing: -0.5 }}>{clearedPct}%</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#7E9A9B' }}>of the haze</Text>
        </View>
      </PressableScale>
    </View>
  );
}
