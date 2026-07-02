import { Children, type ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { PressableScale } from 'pressto';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.muted,
        paddingLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

export function Group({ children }: { children: ReactNode }) {
  const { name, colors } = useTheme();
  const items = Children.toArray(children);
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: name === 'dark' ? withAlpha(colors.surface, 0.55) : colors.surface,
        overflow: 'hidden',
      }}
    >
      {items.map((child, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: withAlpha(colors.line, 0.7) } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

type RowProps = {
  label: string;
  value?: string;
  right?: ReactNode;
  danger?: boolean;
  onPress?: () => void;
};

const ROW_STYLE: ViewStyle = {
  paddingVertical: 15,
  paddingHorizontal: 18,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
};

export function Row({ label, value, right, danger, onPress }: RowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      <Text style={{ fontFamily: fonts.body, fontSize: 15.5, color: danger ? colors.warn : colors.ink }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value != null ? (
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.muted }}>{value}</Text>
        ) : null}
        {right}
        {onPress ? (
          <Text style={{ fontSize: 21, lineHeight: 22, color: withAlpha(danger ? colors.warn : colors.muted, 0.75) }}>
            ›
          </Text>
        ) : null}
      </View>
    </>
  );

  if (!onPress) return <View style={ROW_STYLE}>{content}</View>;
  return (
    <PressableScale onPress={onPress} style={ROW_STYLE}>
      {content}
    </PressableScale>
  );
}
