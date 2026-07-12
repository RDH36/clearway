import { Text, View } from 'react-native';
import { fonts } from '@/constants/theme';
import { LockIcon } from './icons';

export function PremiumPill() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 20,
        backgroundColor: 'rgba(150,170,172,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(150,170,172,0.22)',
      }}
    >
      <LockIcon size={11} color="#AFC4C2" />
      <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: '#AFC4C2', textTransform: 'uppercase' }}>
        Premium
      </Text>
    </View>
  );
}
