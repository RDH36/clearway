/**
 * Themed text — applies the design-brief type scale (§3) via NativeWind classes.
 * Colors resolve per-theme through CSS variables, so no theme prop is needed.
 */
import { Text as RNText, type TextProps } from 'react-native';

type Variant =
  | 'display' // hero / Bricolage
  | 'headline' // screen headline
  | 'body'
  | 'label' // caption, muted
  | 'mono'; // ticking data

const VARIANT: Record<Variant, string> = {
  display: 'font-display text-counter text-ink',
  headline: 'font-display-semibold text-headline text-ink',
  body: 'font-body text-body text-ink',
  label: 'font-body-medium text-label text-muted',
  mono: 'font-mono text-counter-unit text-muted',
};

type Props = TextProps & {
  variant?: Variant;
  className?: string;
};

export function Text({ variant = 'body', className = '', ...rest }: Props) {
  return <RNText className={`${VARIANT[variant]} ${className}`} {...rest} />;
}
