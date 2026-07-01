import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// B2 — Milestones. Vertical journey of clean-time badges; >1mo premium-locked.
export default function Milestones() {
  return (
    <PlaceholderScreen
      title="B2 · Milestones"
      subtitle="Clean-time badges; past 1 month is premium."
      links={[
        { label: 'See paywall', href: '/paywall', variant: 'secondary' },
        { label: 'Back', back: true, variant: 'secondary' },
      ]}
    />
  );
}
