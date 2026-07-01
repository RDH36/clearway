import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { useQuitStore } from '@/store/useQuitStore';

// B5 — Reset / "I slipped". Zero shame; keeps longestStreakMs, restarts the counter.
export default function Reset() {
  const slip = useQuitStore((s) => s.slip);
  return (
    <PlaceholderScreen
      title="B5 · Reset"
      subtitle="Slips happen. Your longest streak still stands."
      links={[
        { label: 'Reset my counter', back: true, action: slip },
        { label: 'Keep going', back: true, variant: 'secondary' },
      ]}
    />
  );
}
