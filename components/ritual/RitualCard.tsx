import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { useQuitStore, type SessionSlot } from '@/store/useQuitStore';
import { usePremium } from '@/hooks/usePremium';
import { doneToday, nextSession, startableSlot, SLOT_ORDER } from '@/lib/ritual';
import { displayTime } from '@/lib/sessionPlan';
import { fonts } from '@/constants/theme';

const CARD = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  paddingVertical: 13,
  paddingHorizontal: 15,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(91,224,198,0.32)',
  backgroundColor: 'rgba(91,224,198,0.09)',
} as const;

function Dot({ filled, frosted }: { filled: boolean; frosted?: boolean }) {
  return (
    <View
      style={{
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: filled ? '#5BE0C6' : frosted ? 'rgba(159,180,179,0.14)' : 'transparent',
        borderWidth: 1,
        borderColor: frosted ? 'rgba(159,180,179,0.35)' : 'rgba(91,224,198,0.6)',
      }}
    />
  );
}

export function RitualCard({ onStart, onUpgrade }: { onStart: (slot: SessionSlot) => void; onUpgrade: () => void }) {
  const sessions = useQuitStore((s) => s.sessions);
  const sessionLog = useQuitStore((s) => s.sessionLog);
  const { isPremium } = usePremium();
  if (!sessions.enabled) return null;

  const done = doneToday(sessionLog);

  if (!isPremium) {
    const claimed = done.length > 0;
    const now = new Date();
    const [ah, am] = sessions[sessions.anchor].split(':').map(Number);
    const anchorPassed = now.getHours() * 60 + now.getMinutes() >= (ah || 0) * 60 + (am || 0);
    const startSlot = sessions.anchor;
    return (
      <PressableScale onPress={claimed ? onUpgrade : () => onStart(startSlot)} style={CARD}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Dot filled={claimed} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.5, color: '#5BE0C6', textTransform: 'uppercase' }}>
            {`Your ritual · ${claimed ? 1 : 0}/1 today`}
          </Text>
          <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14.5, color: '#EAF4F2' }}>
            {claimed
              ? 'Air claimed. Two more daily moments — Premium ✦'
              : `Next session — ${displayTime(sessions[sessions.anchor])}${anchorPassed ? ' tomorrow' : ''}`}
          </Text>
        </View>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 13, color: '#5BE0C6' }}>
          {claimed ? '✦' : 'Start →'}
        </Text>
      </PressableScale>
    );
  }

  const allDone = done.length >= 3;
  const next = nextSession(sessions, done);
  const startSlot = startableSlot(sessions, done);

  return (
    <PressableScale onPress={() => onStart(startSlot)} style={CARD}>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {SLOT_ORDER.map((slot) => (
          <Dot key={slot} filled={done.includes(slot)} />
        ))}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.5, color: '#5BE0C6', textTransform: 'uppercase' }}>
          {`Your ritual · ${done.length}/3 today`}
        </Text>
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 14.5, color: '#EAF4F2' }}>
          {allDone
            ? 'All three done — clear air today.'
            : `Next session — ${displayTime(next.time)}${next.tomorrow ? ' tomorrow' : ''}`}
        </Text>
      </View>
      {!allDone ? (
        <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 13, color: '#5BE0C6' }}>Start →</Text>
      ) : (
        <Text style={{ fontSize: 15, color: '#5BE0C6' }}>✦</Text>
      )}
    </PressableScale>
  );
}
