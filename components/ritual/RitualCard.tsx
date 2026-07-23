import { Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { useQuitStore } from '@/store/useQuitStore';
import { doneToday, nextSession, startableSlot, SLOT_ORDER } from '@/lib/ritual';
import { displayTime } from '@/lib/sessionPlan';
import { fonts } from '@/constants/theme';

export function RitualCard({ onStart }: { onStart: (slot: string) => void }) {
  const sessions = useQuitStore((s) => s.sessions);
  const sessionLog = useQuitStore((s) => s.sessionLog);
  if (!sessions.enabled) return null;

  const done = doneToday(sessionLog);
  const allDone = done.length >= 3;
  const next = nextSession(sessions, done);
  const startSlot = startableSlot(sessions, done);

  return (
    <PressableScale
      onPress={() => onStart(startSlot)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(91,224,198,0.32)',
        backgroundColor: 'rgba(91,224,198,0.09)',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {SLOT_ORDER.map((slot) => (
          <View
            key={slot}
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: done.includes(slot) ? '#5BE0C6' : 'rgba(91,224,198,0.18)',
              borderWidth: 1,
              borderColor: 'rgba(91,224,198,0.5)',
            }}
          />
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
