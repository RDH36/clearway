import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { fonts } from '@/constants/theme';

export function Toast({ message, onHide }: { message: string | null; onHide: () => void }) {
  const hideRef = useRef(onHide);

  useEffect(() => {
    hideRef.current = onHide;
  });

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => hideRef.current(), 2400);
    return () => clearTimeout(id);
  }, [message]);

  if (!message) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      style={{ position: 'absolute', left: 24, right: 24, bottom: 46, alignItems: 'center', zIndex: 30 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 11,
          paddingHorizontal: 18,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: '#2C474E',
          backgroundColor: 'rgba(21,42,49,0.97)',
        }}
      >
        <Text style={{ fontSize: 12, color: '#5BE0C6' }}>✦</Text>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 13.5, color: '#EAF4F2' }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
