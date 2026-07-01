import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { fonts } from '@/constants/theme';

// Premium craving kit — frosted-lock, visual only (no RevenueCat yet).
const KIT = [
  { title: 'Guided breathing library', sub: '12 sessions for different cravings' },
  { title: 'Urge-surfing timer', sub: 'Ride the wave — it passes in minutes' },
  { title: 'Craving journal', sub: 'Spot your triggers over time' },
];

function Lock() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#AFC4C2" strokeWidth={2}>
      <Rect x={5} y={11} width={14} height={9} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * `haze` (0 clear air → 1 full smoke) darkens the cards as the fog thickens: a
 * light frosted panel reads on cleared air, but over heavy grey smoke it turns
 * into a dark, more opaque panel so the locked rows keep their contrast.
 */
export function CraveKit({ haze = 0 }: { haze?: number }) {
  const t = Math.max(0, Math.min(1, haze));
  const rowSkin = {
    backgroundColor: `rgba(${Math.round(lerp(150, 18, t))},${Math.round(lerp(170, 32, t))},${Math.round(lerp(172, 38, t))},${lerp(0.13, 0.53, t).toFixed(3)})`,
    borderColor: `rgba(150,170,172,${lerp(0.22, 0.36, t).toFixed(3)})`,
  };

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <Text style={styles.eyebrow}>More for cravings</Text>
      {KIT.map((k) => (
        <View key={k.title} style={[styles.row, rowSkin]}>
          <View style={styles.iconWrap}>
            <Lock />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={styles.title}>{k.title}</Text>
            <Text style={styles.sub}>{k.sub}</Text>
          </View>
          <Text style={styles.badge}>Premium</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: '#7E9A9B',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(150,170,172,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(150,170,172,0.22)',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(150,170,172,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#C7D6D4' },
  sub: { fontFamily: fonts.body, fontSize: 12, color: '#8AA1A0' },
  badge: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: '#AFC4C2',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(150,170,172,0.16)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
});
