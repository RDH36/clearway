import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function Scrim() {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="ui-scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#061014" stopOpacity={0.66} />
            <Stop offset="0.22" stopColor="#061014" stopOpacity={0.2} />
            <Stop offset="0.42" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.6" stopColor="#061014" stopOpacity={0} />
            <Stop offset="0.82" stopColor="#061014" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#061014" stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ui-scrim)" />
      </Svg>
    </View>
  );
}
