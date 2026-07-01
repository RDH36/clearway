/**
 * Home icons — react-native-svg, traced 1:1 from the locked 1b design.
 */
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const MUTED = '#9FB4B3';
const SURFACE = '#16282E';

export function SettingsIcon({ color = MUTED, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <Line x1="3" y1="7" x2="21" y2="7" />
      <Line x1="3" y1="12" x2="21" y2="12" />
      <Line x1="3" y1="17" x2="21" y2="17" />
      <Circle cx="9" cy="7" r="2.6" fill={SURFACE} />
      <Circle cx="15.5" cy="12" r="2.6" fill={SURFACE} />
      <Circle cx="8" cy="17" r="2.6" fill={SURFACE} />
    </Svg>
  );
}

export function ProgressIcon({ color = MUTED, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Rect x="4" y="14" width="3.4" height="6" rx="1.5" />
      <Rect x="10.3" y="9.5" width="3.4" height="10.5" rx="1.5" />
      <Rect x="16.6" y="5" width="3.4" height="15" rx="1.5" />
    </Svg>
  );
}

export function OrbIcon({ color = '#5BE0C6', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Circle cx="12" cy="12" r="8.2" />
    </Svg>
  );
}

export function SlipIcon({ color = '#9a6a58', size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5" />
    </Svg>
  );
}
