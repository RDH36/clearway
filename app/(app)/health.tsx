import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// B3 — Health timeline. Recovery markers unlock by elapsed time.
export default function Health() {
  return (
    <PlaceholderScreen
      title="B3 · Health"
      subtitle="What's recovering, unlocking over time."
      links={[
        { label: 'My reasons', href: '/reasons', variant: 'secondary' },
        { label: 'Back', back: true, variant: 'secondary' },
      ]}
    />
  );
}
