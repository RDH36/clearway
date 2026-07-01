import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';

// C1 — Full paywall (modal, reused for all premium triggers). RevenueCat in step 6.
export default function Paywall() {
  return (
    <PlaceholderScreen
      title="C1 · Paywall"
      subtitle="Reached from premium triggers (C2)."
      links={[{ label: 'Close', back: true, variant: 'secondary' }]}
    />
  );
}
