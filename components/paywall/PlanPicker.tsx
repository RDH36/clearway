import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { usePremiumPrices } from '@/hooks/usePremiumPrices';
import type { Plan } from '@/lib/purchases';
import { fonts } from '@/constants/theme';

export type { Plan };

export const PLANS: { id: Plan; title: string; price: string; badge?: string }[] = [
  { id: 'annual', title: 'Annual', price: '$29.99 / year · ≈ $2.50/mo', badge: 'BEST VALUE' },
  { id: 'monthly', title: 'Monthly', price: '$4.99 / month' },
  { id: 'lifetime', title: 'Lifetime', price: '$49.99 once · clear forever' },
];

function Radio({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: on ? 6 : 2,
        borderColor: on ? '#5BE0C6' : '#3A5258',
        backgroundColor: on ? '#08221D' : 'transparent',
      }}
    />
  );
}

export function PlanPicker({ value, onChange }: { value: Plan; onChange: (plan: Plan) => void }) {
  const { prices, trials } = usePremiumPrices();
  return (
    <View style={{ gap: 10 }}>
      {PLANS.map((p) => {
        const selected = value === p.id;
        const base = prices[p.id] ?? p.price;
        const price = trials[p.id] ? `7 days free, then ${base}` : base;
        return (
          <PressableScale
            key={p.id}
            onPress={() => onChange(p.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 15,
              borderRadius: 18,
              borderWidth: 1,
              backgroundColor: selected ? 'rgba(91,224,198,0.1)' : 'rgba(22,40,46,0.7)',
              borderColor: selected ? '#5BE0C6' : '#23383E',
            }}
          >
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>{p.title}</Text>
                {p.badge ? (
                  <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: '#0E1B1F', backgroundColor: '#5BE0C6', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' }}>
                    {p.badge}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#7E9A9B' }}>{price}</Text>
            </View>
            <Radio on={selected} />
          </PressableScale>
        );
      })}
    </View>
  );
}
