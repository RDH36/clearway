import { ScrollView, Text, View, type ViewStyle } from 'react-native';
import { MILESTONES, next, reached, type Milestone } from '@/lib/milestones';
import { countdownLabel } from '@/lib/format';
import { DAY_MS } from '@/constants/time';
import { fonts } from '@/constants/theme';
import { TimelineRow, type NodeState } from './TimelineRow';
import { LockIcon } from './icons';

const CARD_VARIANT: Record<NodeState, ViewStyle> = {
  current: { backgroundColor: 'rgba(91,224,198,0.09)', borderColor: 'rgba(91,224,198,0.3)' },
  locked: { backgroundColor: 'rgba(150,170,172,0.09)', borderColor: 'rgba(150,170,172,0.16)' },
  reached: { backgroundColor: 'rgba(22,40,46,0.72)', borderColor: '#23383E' },
  idle: { backgroundColor: 'rgba(22,40,46,0.72)', borderColor: '#23383E' },
};

function stateFor(m: Milestone, ms: number, currentId: string | null): NodeState {
  if (ms >= m.atMs) return 'reached';
  if (m.premiumLocked) return 'locked';
  return m.id === currentId ? 'current' : 'idle';
}

function subFor(m: Milestone, state: NodeState, ms: number, quit: number): string {
  if (state === 'reached') {
    const d = new Date(quit + m.atMs);
    return `Reached ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (state === 'locked') return 'Air not yet cleared';
  return countdownLabel(m.atMs - ms);
}

function PremiumPill() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 20,
        backgroundColor: 'rgba(150,170,172,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(150,170,172,0.22)',
      }}
    >
      <LockIcon size={11} color="#AFC4C2" />
      <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: '#AFC4C2', textTransform: 'uppercase' }}>
        Premium
      </Text>
    </View>
  );
}

export function MilestonesTab({ ms, quit }: { ms: number; quit: number }) {
  const nx = next(ms);
  const currentId = nx && !nx.premiumLocked ? nx.id : null;
  const reachedCount = reached(ms).length;
  const days = Math.floor(ms / DAY_MS);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3', paddingTop: 4 }}>
        {`${days} day${days === 1 ? '' : 's'} clear · ${reachedCount} of ${MILESTONES.length} reached`}
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {MILESTONES.map((m, i) => {
          const state = stateFor(m, ms, currentId);
          return (
            <TimelineRow key={m.id} state={state} isLast={i === MILESTONES.length - 1} size={34}>
              <View
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                  },
                  CARD_VARIANT[state],
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: state === 'locked' ? '#AFC4C2' : '#EAF4F2' }}>
                    {m.label}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#9FB4B3' }}>
                    {subFor(m, state, ms, quit)}
                  </Text>
                </View>
                {state === 'locked' ? <PremiumPill /> : null}
              </View>
            </TimelineRow>
          );
        })}
      </ScrollView>
    </View>
  );
}
