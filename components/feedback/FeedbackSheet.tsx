import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/components/settings/SettingsGroup';
import { SettingsSheet, SheetButton } from '@/components/settings/SettingsSheet';
import { submitFeedback } from '@/lib/feedback';
import { haptics } from '@/lib/haptics';

const MAX_LENGTH = 500;

export function FeedbackSheet({ onClose }: { onClose: () => void }) {
  const { name, colors } = useTheme();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const dark = name === 'dark';
  const inputStyle = {
    backgroundColor: dark ? 'rgba(11,24,28,0.6)' : withAlpha(colors.haze, 0.25),
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
  } as const;

  const send = async (requestClose: (after?: () => void) => void) => {
    if (!message.trim() || sending) return;
    setSending(true);
    setFailed(false);
    const ok = await submitFeedback(message, email);
    setSending(false);
    if (!ok) {
      setFailed(true);
      return;
    }
    haptics.milestone();
    setSent(true);
    setTimeout(() => requestClose(), 1600);
  };

  return (
    <SettingsSheet title="Send feedback" onClose={onClose}>
      {(requestClose) =>
        sent ? (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 18 }}>
            <Text style={{ fontSize: 30, color: '#5BE0C6' }}>✦</Text>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 19, color: colors.ink, textAlign: 'center' }}>
              Received — thank you.
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, textAlign: 'center' }}>
              Every message shapes what Clearway becomes.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted }}>
              A bug, an idea, a word — it lands directly with the person building Clearway.
            </Text>
            <View>
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor={colors.muted}
                value={message}
                onChangeText={setMessage}
                maxLength={MAX_LENGTH}
                multiline
                style={[inputStyle, { minHeight: 110, textAlignVertical: 'top' }]}
              />
              <Text style={{ marginTop: 4, textAlign: 'right', fontFamily: fonts.mono, fontSize: 10, color: colors.muted }}>
                {message.length} / {MAX_LENGTH}
              </Text>
            </View>
            <TextInput
              placeholder="Email — only if you'd like a reply"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />
            {failed ? (
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.warn }}>
                {"Couldn't send — check your connection and try again."}
              </Text>
            ) : null}
            <View style={{ gap: 10 }}>
              <SheetButton label={sending ? 'Sending…' : 'Send'} onPress={() => send(requestClose)} />
              <SheetButton label="Cancel" variant="ghost" onPress={() => requestClose()} />
            </View>
          </View>
        )
      }
    </SettingsSheet>
  );
}
