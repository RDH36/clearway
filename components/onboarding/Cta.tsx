import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';

export function Cta({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5BE0C6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5BE0C6',
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <View>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: '#0C4A3E' }}>{label}</Text>
      </View>
    </PressableScale>
  );
}
