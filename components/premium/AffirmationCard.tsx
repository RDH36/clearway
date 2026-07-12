import { Text, View } from 'react-native';
import { useQuitStore } from '@/store/useQuitStore';
import { usePremium } from '@/hooks/usePremium';
import { pickAffirmation, reasonLabel, shouldShowFreeTaste } from '@/lib/affirmations';
import { formatMoney } from '@/lib/format';
import { moneySaved } from '@/lib/money';
import { DAY_MS } from '@/constants/time';
import { fonts } from '@/constants/theme';

export function AffirmationCard({ ms }: { ms: number }) {
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const firstReason = useQuitStore((s) => s.reasons[0]?.title);
  const { isPremium } = usePremium();

  const days = Math.max(1, Math.floor(ms / DAY_MS));
  if (!isPremium && !shouldShowFreeTaste(days)) return null;

  const affirmation = pickAffirmation({
    motivation,
    moment: 'general',
    seed: days,
    reason: reasonLabel(firstReason, motivation),
    days,
    money: formatMoney(moneySaved(weekly, ms)),
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(91,224,198,0.18)',
        backgroundColor: 'rgba(91,224,198,0.07)',
      }}
    >
      <Text style={{ fontSize: 15, color: '#5BE0C6', lineHeight: 18 }}>✦</Text>
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.body,
          fontSize: 13.5,
          lineHeight: 19,
          color: '#C7D6D4',
        }}
      >
        {affirmation.text}
      </Text>
    </View>
  );
}
