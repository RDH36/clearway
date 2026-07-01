import type { Href } from 'expo-router';
import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// D — Settings. Your quit · App · Premium · Support · About.
export default function Settings() {
  return (
    <PlaceholderScreen
      title="D · Settings"
      subtitle="Appearance, notifications, premium, about."
      links={[
        { label: 'Reset / start over', href: '/reset', variant: 'secondary' },
        { label: 'My reasons', href: '/reasons', variant: 'secondary' },
        // TEMP (Step 2/3 sanity) — remove with app/debug.tsx
        { label: '🔧 Core-logic debug', href: '/debug' as Href, variant: 'secondary' },
        { label: 'Back', back: true, variant: 'secondary' },
      ]}
    />
  );
}
