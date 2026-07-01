import { StyleSheet, Text } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { PressableScale } from 'pressto';
import { playBreathCue } from '@/lib/sound';
import { fonts } from '@/constants/theme';

// On/off sound parameter, sat on the title line. Turning it on previews the chime.
function SpeakerOn({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 5 6 9H3v6h3l5 4z" />
      <Path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </Svg>
  );
}

function SpeakerOff({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 5 6 9H3v6h3l5 4z" />
      <Line x1={16} y1={9} x2={22} y2={15} />
      <Line x1={22} y1={9} x2={16} y2={15} />
    </Svg>
  );
}

export function SoundToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const toggle = () => {
    const next = !value;
    onChange(next);
    if (next) playBreathCue();
  };

  const color = value ? '#5BE0C6' : '#7E9A9B';

  return (
    <PressableScale
      onPress={toggle}
      style={[
        styles.pill,
        {
          borderColor: value ? 'rgba(91,224,198,0.4)' : 'rgba(150,170,172,0.22)',
          backgroundColor: value ? 'rgba(91,224,198,0.12)' : 'rgba(150,170,172,0.08)',
        },
      ]}
    >
      {value ? <SpeakerOn color={color} /> : <SpeakerOff color={color} />}
      <Text style={[styles.label, { color }]}>{value ? 'On' : 'Off'}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13 },
});
