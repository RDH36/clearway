import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useQuitStore } from '@/store/useQuitStore';
import { haptics } from '@/lib/haptics';
import { SettingsSheet, SheetButton } from '../SettingsSheet';

export function ConfirmDeleteSheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  const resetAll = useQuitStore((s) => s.resetAll);

  const confirm = (requestClose: (after?: () => void) => void) => {
    haptics.resetConfirm();
    requestClose(() => {
      resetAll();
      router.replace('/onboarding/welcome');
    });
  };

  return (
    <SettingsSheet title="Delete my data?" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.muted }}>
            This wipes your quit date, streak record, reasons and settings from this device — permanently. There is no
            undo.
          </Text>
          <View style={{ gap: 10 }}>
            <SheetButton label="Delete everything" danger onPress={() => confirm(requestClose)} />
            <SheetButton label="Keep my data" variant="ghost" onPress={() => requestClose()} />
          </View>
        </View>
      )}
    </SettingsSheet>
  );
}
