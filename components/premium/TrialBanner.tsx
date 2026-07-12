import { Text } from 'react-native';
import { PressableScale } from 'pressto';
import { usePremium } from '@/hooks/usePremium';
import { fonts } from '@/constants/theme';

export function TrialBanner({ onPress }: { onPress: () => void }) {
  const { trialActive, entitled, trialDaysLeft } = usePremium();
  if (!trialActive || entitled) return null;

  const label =
    trialDaysLeft <= 1 ? 'Last day of premium — keep it' : `${trialDaysLeft} days of premium left`;

  return (
    <PressableScale
      onPress={onPress}
      style={{
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 6,
        paddingHorizontal: 13,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(91,224,198,0.3)',
        backgroundColor: 'rgba(91,224,198,0.10)',
        marginTop: 10,
      }}
    >
      <Text style={{ fontSize: 11, color: '#5BE0C6', lineHeight: 13 }}>✦</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12.5, color: '#5BE0C6' }}>{label}</Text>
    </PressableScale>
  );
}
