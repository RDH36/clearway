import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { fonts } from '@/constants/theme';

const MIN = 10;
const MAX = 120;
const STEP = 5;
const THUMB = 34;
const BUBBLE_W = 168;

const snap = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v / STEP) * STEP));

export function SpendSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    haptics.tap();
  }, [value]);

  const pan = useMemo(() => {
    const usable = Math.max(1, trackWidth - THUMB);
    const fromX = (x: number) => snap(MIN + ((x - THUMB / 2) / usable) * (MAX - MIN));
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => onChange(fromX(evt.nativeEvent.locationX)),
      onPanResponderMove: (evt) => onChange(fromX(evt.nativeEvent.locationX)),
    });
  }, [trackWidth, onChange]);

  const ratio = (value - MIN) / (MAX - MIN);
  const thumbLeft = ratio * Math.max(0, trackWidth - THUMB);
  const bubbleLeft = Math.min(Math.max(thumbLeft + THUMB / 2 - BUBBLE_W / 2, 0), Math.max(0, trackWidth - BUBBLE_W));

  return (
    <View style={{ gap: 6 }}>
      <View style={{ alignItems: 'center', gap: 3, marginBottom: 14 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 54, lineHeight: 58, color: '#EAF4F2', letterSpacing: -1.5 }}>
          {`$${value}`}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: '#7E9A9B', textTransform: 'uppercase' }}>
          per week{value >= MAX ? ' · or more' : ''}
        </Text>
      </View>

      <View
        {...pan.panHandlers}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{ height: 56, justifyContent: 'center' }}
      >
        <View style={{ height: 8, borderRadius: 4, backgroundColor: '#1B3238' }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: THUMB / 2, right: THUMB / 2, height: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <View key={i} style={{ width: 2, height: 4, borderRadius: 1, backgroundColor: 'rgba(159,180,179,0.4)' }} />
          ))}
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            width: thumbLeft + THUMB / 2,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(91,224,198,0.55)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: thumbLeft,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: '#5BE0C6',
            borderWidth: 3,
            borderColor: '#0B181C',
          }}
        />
      </View>

      <View style={{ height: 62 }}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: bubbleLeft,
            width: BUBBLE_W,
            alignItems: 'center',
            gap: 1,
            paddingVertical: 8,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(91,224,198,0.35)',
            backgroundColor: 'rgba(91,224,198,0.1)',
          }}
        >
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 19, color: '#5BE0C6', letterSpacing: -0.3 }}>
            {`$${(value * 52).toLocaleString('en-US')} a year`}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: '#9FB4B3' }}>going up in vapor</Text>
        </View>
      </View>
    </View>
  );
}
