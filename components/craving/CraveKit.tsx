import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { BREATH_PATTERNS, type BreathPattern, type PatternId } from '@/lib/breathing';

function Lock() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#AFC4C2" strokeWidth={2}>
      <Rect x={5} y={11} width={14} height={9} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

function Wave({ on }: { on: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={on ? '#5BE0C6' : '#AFC4C2'} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3-3.5 5-2" />
    </Svg>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The premium craving kit — the extra breathing patterns. Free users see the
 * frosted locked rows (tap → paywall); premium users pick their pattern here.
 * `haze` (0 clear air → 1 full smoke) darkens the cards as the fog thickens so
 * the rows keep their contrast over heavy grey smoke.
 */
export function CraveKit({
  haze = 0,
  isPremium,
  activeId,
  onSelect,
  onLockedPress,
}: {
  haze?: number;
  isPremium: boolean;
  activeId: PatternId;
  onSelect: (pattern: BreathPattern) => void;
  onLockedPress: () => void;
}) {
  const t = Math.max(0, Math.min(1, haze));
  const rowSkin = {
    backgroundColor: `rgba(${Math.round(lerp(150, 18, t))},${Math.round(lerp(170, 32, t))},${Math.round(lerp(172, 38, t))},${lerp(0.13, 0.53, t).toFixed(3)})`,
    borderColor: `rgba(150,170,172,${lerp(0.22, 0.36, t).toFixed(3)})`,
  };
  const patterns = BREATH_PATTERNS.filter((p) => p.premium);

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <Text style={styles.eyebrow}>More for cravings</Text>
      {patterns.map((p) => {
        const active = isPremium && activeId === p.id;
        return (
          <PressableScale
            key={p.id}
            onPress={() => (isPremium ? onSelect(p) : onLockedPress())}
            style={[
              styles.row,
              rowSkin,
              active ? { borderColor: 'rgba(91,224,198,0.55)', backgroundColor: 'rgba(91,224,198,0.10)' } : null,
            ]}
          >
            <View style={[styles.iconWrap, active ? { backgroundColor: 'rgba(91,224,198,0.16)' } : null]}>
              {isPremium ? <Wave on={active} /> : <Lock />}
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.title, active ? { color: '#EAF4F2' } : null]}>{p.name}</Text>
              <Text style={styles.sub}>{p.sub}</Text>
            </View>
            {isPremium ? (
              active ? <Text style={styles.activeBadge}>On</Text> : null
            ) : (
              <Text style={styles.badge}>Premium</Text>
            )}
          </PressableScale>
        );
      })}
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
  activeBadge: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: '#5BE0C6',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(91,224,198,0.14)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
});
