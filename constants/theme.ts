/**
 * Design tokens — design brief §3.
 *
 * NativeWind utilities (bg-base, text-ink, …) are the primary way to consume
 * colors and resolve per-theme via CSS variables (see global.css / tailwind.config).
 * This file is the programmatic source of truth for the same values — used where
 * raw hex is needed (Reanimated atmosphere, status bar, splash, gradients).
 */

export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  base: string; // bg/base — app background
  surface: string; // bg/surface — cards, sheets
  haze: string; // bg/haze — early-streak fog overlay
  ink: string; // text/primary
  muted: string; // text/muted
  clear: string; // accent/clear — aqua, primary CTA
  dawn: string; // accent/dawn — milestone / pride
  warn: string; // warm terracotta — "I slipped" / caution (understated, never alarm)
  line: string; // hairlines, dividers
};

export const darkColors: ThemeColors = {
  base: '#0E1B1F',
  surface: '#16282E',
  haze: '#33474C',
  ink: '#EAF4F2',
  muted: '#7E9A9B',
  clear: '#5BE0C6',
  dawn: '#FFB57A',
  warn: '#C08A77', // muted terracotta — legible but easy on the eyes, never alarm
  line: '#23383E',
};

export const lightColors: ThemeColors = {
  base: '#EEF5F2',
  surface: '#FFFFFF',
  haze: '#C9D8D6',
  ink: '#0E1B1F',
  muted: '#5C7375',
  clear: '#13A88C',
  dawn: '#E8894C',
  warn: '#C2613B',
  line: '#DBE6E3',
};

export const themes: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

/**
 * Font family keys — must match tailwind.config.js `fontFamily` and the loaded
 * @expo-google-fonts names (see app/_layout.tsx). Use for non-className styling.
 */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemibold: 'BricolageGrotesque_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemibold: 'HankenGrotesk_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;

/** Spacing / radius constants from the brief (4px grid). */
export const layout = {
  screenPadding: 24,
  tileGap: 12,
  radius: { card: 20, button: 16 },
} as const;
