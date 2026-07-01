/**
 * Hero counter — the functional hero (design brief B1). Big day number in
 * Bricolage, h:m:s in Geist Mono (mono → seconds never shift the layout), and a
 * status line that softens with the streak. Derives live from msClean.
 */
import { Text, View } from 'react-native';
import { formatClean } from '@/lib/time';
import { fonts } from '@/constants/theme';

const pad = (n: number) => String(n).padStart(2, '0');

export function HeroCounter({ msClean, statusCopy }: { msClean: number; statusCopy: string }) {
  const { days, hours, minutes, seconds } = formatClean(msClean);
  const hms = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ fontFamily: fonts.display, fontSize: 144, lineHeight: 132, color: '#EAF4F2', letterSpacing: -4 }}
        >
          {days}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: 3, color: '#7E9A9B', textTransform: 'uppercase' }}>
          {days === 1 ? 'day clear' : 'days clear'}
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.monoMedium, fontSize: 48, color: '#EAF4F2', letterSpacing: 1, marginTop: 20 }}>
        {hms}
      </Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: '#9FB4B3', textAlign: 'center', maxWidth: 280, marginTop: 18 }}>
        {statusCopy}
      </Text>
    </View>
  );
}
