import { Linking, Text, View } from 'react-native';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { SettingsSheet, SheetButton } from '../SettingsSheet';

const CC_URL = 'https://creativecommons.org/licenses/by/4.0/';
const INCOMPETECH_URL = 'https://incompetech.com';

export function CreditsSheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <SettingsSheet title="Audio credits" onClose={onClose}>
      {(requestClose) => (
        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14.5, color: colors.ink }}>
              Session music
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.muted }}>
              {'"Meditation Impromptu 01" — Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0'}
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14.5, color: colors.ink }}>
              Voice cues
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.muted }}>
              Generated with Piper TTS — LJSpeech voice (public domain).
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <SheetButton label="View CC BY 4.0 license" onPress={() => Linking.openURL(CC_URL)} />
            <SheetButton label="incompetech.com" variant="ghost" onPress={() => Linking.openURL(INCOMPETECH_URL)} />
            <SheetButton label="Close" variant="ghost" onPress={() => requestClose()} />
          </View>
        </View>
      )}
    </SettingsSheet>
  );
}
