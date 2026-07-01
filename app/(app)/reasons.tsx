import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// B6 — My reasons. The "why" cards from onboarding, editable.
export default function Reasons() {
  return (
    <PlaceholderScreen
      title="B6 · My reasons"
      subtitle="Your motivation anchor, editable."
      links={[{ label: 'Back', back: true, variant: 'secondary' }]}
    />
  );
}
