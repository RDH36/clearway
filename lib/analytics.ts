import PostHog from 'posthog-react-native';

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const configured = apiKey.startsWith('phc_');

export const posthog = new PostHog(configured ? apiKey : 'phc_disabled', {
  host,
  disabled: !configured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  requestTimeout: 10000,
});

posthog.register({ app: 'clearway' });

export function track(event: string, properties?: Record<string, string | number | boolean | null>) {
  posthog.capture(event, properties);
}
