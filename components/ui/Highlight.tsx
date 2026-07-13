import { Text, type StyleProp, type TextStyle } from 'react-native';
import { fonts } from '@/constants/theme';

export function Highlight({
  text,
  style,
  accentColor = '#5BE0C6',
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  accentColor?: string;
}) {
  const parts = text.split('**');
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={{ color: accentColor, fontFamily: fonts.bodySemibold }}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}
