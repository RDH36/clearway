import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PressableScale } from 'pressto';
import type { Reason } from '@/store/useQuitStore';
import { fonts } from '@/constants/theme';

function PencilIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#7E9A9B" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C08A77" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Path d="M10 11v6" />
      <Path d="M14 11v6" />
    </Svg>
  );
}

export function ReasonCard({
  reason,
  onEdit,
  onDelete,
}: {
  reason: Reason;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 13,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#23383E',
        backgroundColor: 'rgba(22,40,46,0.72)',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: 'rgba(91,224,198,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20, color: '#5BE0C6', lineHeight: 24 }}>{reason.glyph}</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bodySemibold, fontSize: 16, color: '#EAF4F2' }}>
            {reason.title.trim() || 'My reason'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <PressableScale onPress={onEdit} style={{ padding: 4 }}>
              <PencilIcon />
            </PressableScale>
            <PressableScale onPress={onDelete} style={{ padding: 4 }}>
              <TrashIcon />
            </PressableScale>
          </View>
        </View>
        {reason.note.trim() ? (
          <Text style={{ fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: '#C7D6D4' }}>
            {reason.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
