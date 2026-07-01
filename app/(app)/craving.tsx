import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// B4 — Craving tool ("I need a moment"). The 4-7-8 breathing orb (modal sheet).
export default function Craving() {
  return (
    <PlaceholderScreen
      title="B4 · Craving"
      subtitle="Breathe in… hold… out. One free exercise."
      links={[
        { label: 'Unlock full kit', href: '/paywall' },
        { label: 'That one passed', back: true, variant: 'secondary' },
      ]}
    />
  );
}
