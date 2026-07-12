import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { PressableScale } from 'pressto';
import { useQuitStore, type Reason } from '@/store/useQuitStore';
import { usePremium } from '@/hooks/usePremium';
import { msClean } from '@/lib/time';
import { fonts } from '@/constants/theme';
import { Atmosphere } from '@/components/home/Atmosphere';
import { Scrim } from '@/components/ui/Scrim';
import { StaggerIn } from '@/components/ui/StaggerIn';
import { ReasonCard } from '@/components/reasons/ReasonCard';
import { ReasonModal, type ReasonValues } from '@/components/reasons/ReasonModal';
import { seedReason } from '@/components/reasons/seeds';
import { BackIcon, LockIcon } from '@/components/progress/icons';

const BTN = {
  width: 44,
  height: 44,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: '#23383E',
  backgroundColor: 'rgba(22,40,46,0.5)',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

export default function Reasons() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const quit = useQuitStore((s) => s.quitTimestamp);
  const reasons = useQuitStore((s) => s.reasons);
  const setReasons = useQuitStore((s) => s.setReasons);
  const addReason = useQuitStore((s) => s.addReason);
  const updateReason = useQuitStore((s) => s.updateReason);
  const removeReason = useQuitStore((s) => s.removeReason);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Reason | null>(null);
  const { isPremium } = usePremium();
  const canAdd = isPremium || reasons.length < 3;

  const submit = (values: ReasonValues) => {
    if (editing) updateReason(editing.id, values);
    else addReason({ id: `r-${Date.now()}`, ...values });
  };
  const closeModal = () => {
    setAdding(false);
    setEditing(null);
  };
  const motivation = useQuitStore((s) => s.primaryMotivation);
  const weekly = useQuitStore((s) => s.weeklySpend);

  useEffect(() => {
    if (reasons.length === 0) setReasons([seedReason(motivation, weekly)]);
  }, [reasons.length, setReasons, motivation, weekly]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1B1F' }}>
      <StatusBar style="light" />
      <Atmosphere key={quit ?? 0} msClean={msClean(quit)} smoke={false} />
      <Scrim />

      <View style={{ flex: 1, zIndex: 3, paddingTop: insets.top + 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, marginBottom: 14 }}>
          <PressableScale onPress={() => router.back()} style={BTN}>
            <BackIcon />
          </PressableScale>
          <StaggerIn index={0} base={30} duration={240} style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 27, color: '#EAF4F2', letterSpacing: -0.4 }}>
              My why
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: '#9FB4B3' }}>
              Your anchor when a craving hits.
            </Text>
          </StaggerIn>
        </View>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 30, gap: 13 }}
          bottomOffset={24}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {reasons.map((r, i) => (
            <StaggerIn key={r.id} index={i + 1} base={30} step={30} duration={240}>
              <ReasonCard
                reason={r}
                onEdit={() => setEditing(r)}
                onDelete={() => removeReason(r.id)}
              />
            </StaggerIn>
          ))}

          <StaggerIn index={reasons.length + 1} base={30} step={30} duration={240}>
            <PressableScale
              onPress={() => (canAdd ? setAdding(true) : router.push('/paywall'))}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: '#2F4950',
                borderRadius: 20,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
              }}
            >
              {canAdd ? (
                <Text style={{ fontSize: 18, color: '#9FB4B3', lineHeight: 20 }}>+</Text>
              ) : (
                <LockIcon size={14} color="#9FB4B3" />
              )}
              <Text style={{ fontFamily: fonts.bodySemibold, fontSize: 15, color: '#9FB4B3' }}>
                {canAdd ? 'Add a reason' : 'Unlimited reasons — Premium'}
              </Text>
            </PressableScale>
          </StaggerIn>

          <Text style={{ fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: '#7E9A9B', textAlign: 'center', paddingHorizontal: 10, paddingTop: 2 }}>
            {'These appear when you tap "I need a moment."'}
          </Text>
        </KeyboardAwareScrollView>
      </View>

      <ReasonModal visible={adding || editing !== null} initial={editing} onSubmit={submit} onClose={closeModal} />
    </View>
  );
}
