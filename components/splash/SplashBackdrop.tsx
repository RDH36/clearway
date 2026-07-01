/**
 * Splash background — the "atmosphere" layer from the Logo & Splash brief: a deep
 * petrol linear gradient with an aqua sky glow up top and a dawn horizon glow
 * below. Static (no streak logic) — this is the brand launch frame, always dark.
 */
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

function Layer({ opacity, children }: { opacity?: number; children: React.ReactNode }) {
  return (
    <View style={[StyleSheet.absoluteFill, opacity != null ? { opacity } : null]} pointerEvents="none">
      <Svg width="100%" height="100%">{children}</Svg>
    </View>
  );
}

export function SplashBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* depth — diagonal petrol gradient (165deg in the brief) */}
      <Layer>
        <Defs>
          <LinearGradient id="sp-depth" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor="#0C2025" />
            <Stop offset="0.52" stopColor="#0E1B1F" />
            <Stop offset="1" stopColor="#10302A" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sp-depth)" />
      </Layer>

      {/* aqua sky glow (top) */}
      <Layer opacity={0.32}>
        <Defs>
          <RadialGradient id="sp-aqua" cx="50%" cy="-2%" rx="120%" ry="78%">
            <Stop offset="0" stopColor="#5BE0C6" stopOpacity={1} />
            <Stop offset="0.56" stopColor="#5BE0C6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sp-aqua)" />
      </Layer>

      {/* dawn horizon glow (bottom) */}
      <Layer opacity={0.24}>
        <Defs>
          <RadialGradient id="sp-dawn" cx="50%" cy="112%" rx="132%" ry="56%">
            <Stop offset="0" stopColor="#FFBA80" stopOpacity={1} />
            <Stop offset="0.6" stopColor="#FFBA80" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sp-dawn)" />
      </Layer>
    </View>
  );
}
