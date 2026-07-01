/**
 * TEMP — Step 2 sanity screen.
 *  - STORE section = the REAL persisted state (survives navigation + app restart).
 *  - Sample sections = FIXED offsets (16d / 200d) for checking the pure math; these
 *    intentionally recompute on mount — they are reference checks, not live state.
 * DELETE after Step 2 is validated (also remove its <Stack.Screen name="debug"/> in
 * app/_layout.tsx and the temp buttons on Home + Welcome).
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { HapticsProbe } from '@/components/debug/HapticsProbe';
import { useQuitStore } from '@/store/useQuitStore';
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from '@/constants/time';
import { formatClean, msClean } from '@/lib/time';
import { moneySaved, projectedYear } from '@/lib/money';
import { MILESTONES, current, next, reached } from '@/lib/milestones';
import { nextMarker, unlocked } from '@/lib/health';
import { BREATH_CYCLE_MS, phaseAt } from '@/lib/breathing';

const OFFSET_16D = 16 * DAY_MS + 6 * HOUR_MS + 41 * MINUTE_MS + 9 * SECOND_MS;
const WEEKLY = 40;

const pad = (n: number) => String(n).padStart(2, '0');
const money = (n: number) => `$${n.toFixed(2)}`;

function dur(ms: number) {
  const p = formatClean(ms);
  return `${p.days}d ${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5 rounded-card border border-line bg-surface p-4">
      <Text variant="label" className="mb-2 uppercase">{title}</Text>
      {children}
    </View>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3 py-0.5">
      <Text variant="body" className="flex-1 text-muted">{k}</Text>
      <Text variant="body" className="font-mono" style={ok === false ? { opacity: 0.5 } : undefined}>
        {v}
      </Text>
    </View>
  );
}

export default function Debug() {
  // Fixed sample timestamps for the pure-math checks (recompute on mount, by design).
  const quit16 = useRef(Date.now() - OFFSET_16D).current;
  const quit200 = useRef(Date.now() - 200 * DAY_MS).current;
  const mount = useRef(Date.now()).current;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Real PERSISTED store state (survives navigation + app restart).
  const storeQuit = useQuitStore((s) => s.quitTimestamp);
  const longest = useQuitStore((s) => s.longestStreakMs);
  const weekly = useQuitStore((s) => s.weeklySpend);
  const onboarded = useQuitStore((s) => s.onboardingComplete);
  const startQuit = useQuitStore((s) => s.startQuit);
  const slip = useQuitStore((s) => s.slip);
  const setQuizAnswers = useQuitStore((s) => s.setQuizAnswers);
  const resetAll = useQuitStore((s) => s.resetAll);
  const storeMs = msClean(storeQuit, now);

  const ms16 = msClean(quit16, now);
  const ms200 = msClean(quit200, now);

  // Pure reset demo: longest 5d, current 16d → keeps the larger, counter to 0.
  const seedLongest = 5 * DAY_MS;
  const afterLongest = Math.max(seedLongest, ms16);

  const breath = phaseAt(now - mount);
  const samples = [0, 4000, 11000, 18999, BREATH_CYCLE_MS];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="py-4">
        <Text variant="headline" className="mb-1">Core-logic debug</Text>
        <Text variant="label" className="mb-5">STORE = real persisted state · Samples = fixed offsets for math checks</Text>

        <HapticsProbe />

        <Section title="STORE — persisted via AsyncStorage">
          <Row k="quitTimestamp" v={storeQuit != null ? String(storeQuit) : 'null'} />
          <Row k="counter (from store)" v={storeQuit != null ? dur(storeMs) : '—'} />
          <Row k="longestStreakMs" v={dur(longest)} />
          <Row k="weeklySpend" v={`$${weekly}`} />
          <Row k="onboardingComplete" v={String(onboarded)} />
          <View className="mt-3 gap-2">
            <Button
              label="Set quit = 16d ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - OFFSET_16D, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 93d ago + $40 (clear air)"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 93 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 1 year ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 365 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 3 years ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 3 * 365 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 5 years ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 5 * 365 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 7 years ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 7 * 365 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button
              label="Set quit = 10 years ago + $40"
              variant="secondary"
              onPress={() => setQuizAnswers({ quitTimestamp: Date.now() - 10 * 365 * DAY_MS, weeklySpend: 40, currency: 'USD' })}
            />
            <Button label="Start quit = now (max haze)" variant="secondary" onPress={startQuit} />
            <Button label="Slip (reset, keep longest)" variant="secondary" onPress={slip} />
            <Button label="Clear all (resetAll)" variant="secondary" onPress={resetAll} />
          </View>
          <Text variant="label" className="mt-3">
            Set a value → fully close the app → reopen → same quitTimestamp must reappear.
          </Text>
        </Section>

        <Section title="lib/time — sample (16d 6:41:09)">
          <Row k="msClean (raw)" v={`${ms16} ms`} />
          <Row k="formatClean" v={dur(ms16)} />
          <Row k="expect days" v="16" ok={formatClean(ms16).days === 16} />
        </Section>

        <Section title="lib/money — sample">
          <Row k="moneySaved(40, live 16d+)" v={money(moneySaved(WEEKLY, ms16))} />
          <Row
            k="moneySaved(40, exactly 16d)"
            v={money(moneySaved(WEEKLY, 16 * DAY_MS))}
            ok={money(moneySaved(WEEKLY, 16 * DAY_MS)) === '$91.43'}
          />
          <Row k="projectedYear(40)" v={money(projectedYear(WEEKLY))} ok={projectedYear(WEEKLY) === 2080} />
        </Section>

        <Section title="lib/milestones @ 16 days">
          <Row k="reached" v={`${reached(ms16).length} / ${MILESTONES.length}`} />
          <Row k="current" v={current(ms16)?.label ?? '—'} />
          <Row k="next" v={next(ms16)?.label ?? '—'} />
          {MILESTONES.map((m) => {
            const hit = ms16 >= m.atMs;
            return <Row key={m.id} k={`${hit ? '✓' : '·'} ${m.label}`} v={m.premiumLocked ? 'premium' : 'free'} ok={hit} />;
          })}
        </Section>

        <Section title="lib/milestones @ 200 days (lock demo)">
          <Row k="current" v={current(ms200)?.label ?? '—'} />
          <Row k="next" v={next(ms200)?.label ?? '—'} />
          <Row k="reached & locked" v={reached(ms200).filter((m) => m.premiumLocked).map((m) => m.id).join(', ') || '—'} />
        </Section>

        <Section title="lib/health @ 16 days">
          <Row k="unlocked" v={`${unlocked(ms16).length}`} />
          {unlocked(ms16).map((m) => (
            <Row key={m.id} k={`✓ ${m.id}`} v={m.title} />
          ))}
          <Row k="next up" v={nextMarker(ms16)?.title ?? '—'} />
          <Row k="unlocks in" v={nextMarker(ms16) ? dur(nextMarker(ms16)!.inMs) : '—'} />
        </Section>

        <Section title="lib/breathing — 4-7-8 live">
          <Row k="phase" v={`${breath.label} (${breath.phase})`} />
          <Row k="progress" v={`${Math.round(breath.progress * 100)}%`} />
          <Row k="cycle #" v={`${breath.cycle}`} />
          {samples.map((s) => (
            <Row key={s} k={`phaseAt(${s})`} v={`${phaseAt(s).phase} @ ${Math.round(phaseAt(s).progress * 100)}%`} />
          ))}
        </Section>

        <Section title="store reset — keeps longest streak (sample)">
          <Row k="seed longestStreakMs" v={dur(seedLongest)} />
          <Row k="current streak (16d)" v={dur(ms16)} />
          <Row k="after slip → longest" v={dur(afterLongest)} ok={afterLongest === ms16} />
          <Row k="after slip → counter" v="0d 00:00:00" />
          <Text variant="label" className="mt-2">Longest grows to 16d (kept), counter restarts at 0.</Text>
        </Section>
      </ScrollView>
    </Screen>
  );
}
