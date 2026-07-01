/**
 * Step-1 placeholder. NOT a real screen — it exists only so routing works and so
 * every route already demonstrates the press-state + haptic foundation. Real
 * screens replace these in later build-order steps (spec §12).
 */
import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Screen } from './Screen';
import { Text } from './Text';
import { Button } from './Button';

export type NavLink = {
  label: string;
  href?: Href; // omit + back:true to dismiss a modal / go back
  back?: boolean;
  replace?: boolean;
  variant?: 'primary' | 'secondary';
  action?: () => void; // store side-effect to run before navigating
};

type Props = {
  title: string;
  subtitle?: string;
  links?: NavLink[];
};

export function PlaceholderScreen({ title, subtitle, links = [] }: Props) {
  const router = useRouter();

  const go = (link: NavLink) => {
    link.action?.();
    if (link.back) return router.back();
    if (!link.href) return;
    if (link.replace) return router.replace(link.href);
    router.push(link.href);
  };

  return (
    <Screen>
      <View className="flex-1 justify-center gap-2">
        <Text variant="headline">{title}</Text>
        {subtitle ? <Text variant="label">{subtitle}</Text> : null}
      </View>
      <View className="gap-3 pb-6">
        {links.map((link) => (
          <Button
            key={link.label}
            label={link.label}
            variant={link.variant ?? 'primary'}
            onPress={() => go(link)}
          />
        ))}
      </View>
    </Screen>
  );
}
