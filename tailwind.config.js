/** @type {import('tailwindcss').Config} */
// Tokens come straight from the design brief §3. Hex values live in global.css as
// CSS variables (RGB triplets) so a single utility (e.g. `bg-base`, `text-ink`)
// resolves to the right value per theme. Dark is the primary theme.
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--color-base) / <alpha-value>)', // bg/base
        surface: 'rgb(var(--color-surface) / <alpha-value>)', // bg/surface
        haze: 'rgb(var(--color-haze) / <alpha-value>)', // bg/haze (early-streak fog)
        ink: 'rgb(var(--color-ink) / <alpha-value>)', // text/primary
        muted: 'rgb(var(--color-muted) / <alpha-value>)', // text/muted
        clear: 'rgb(var(--color-clear) / <alpha-value>)', // accent/clear (aqua)
        dawn: 'rgb(var(--color-dawn) / <alpha-value>)', // accent/dawn (milestones)
        warn: 'rgb(var(--color-warn) / <alpha-value>)', // warm "slipped"/caution
        line: 'rgb(var(--color-line) / <alpha-value>)', // hairlines
      },
      fontFamily: {
        // Display + counter numerals — Bricolage Grotesque
        display: ['BricolageGrotesque_700Bold'],
        'display-semibold': ['BricolageGrotesque_600SemiBold'],
        // Body / UI — Hanken Grotesk
        body: ['HankenGrotesk_400Regular'],
        'body-medium': ['HankenGrotesk_500Medium'],
        'body-semibold': ['HankenGrotesk_600SemiBold'],
        // Data / ticking seconds — Geist Mono
        mono: ['GeistMono_400Regular'],
        'mono-medium': ['GeistMono_500Medium'],
      },
      fontSize: {
        // role: [size, lineHeight] — from the design-brief type scale
        counter: ['72px', { lineHeight: '72px' }], // hero number 64–80pt
        'counter-unit': ['13px', { lineHeight: '16px' }],
        headline: ['28px', { lineHeight: '31px' }], // 26–30pt, lh 1.1
        body: ['16px', { lineHeight: '26px' }], // lh 1.6
        label: ['13px', { lineHeight: '18px' }],
        button: ['16px', { lineHeight: '20px' }],
      },
      borderRadius: {
        card: '20px',
        button: '16px',
        pill: '9999px',
      },
      spacing: {
        screen: '24px', // horizontal screen padding
        tile: '12px', // tile gap
      },
    },
  },
  plugins: [],
};
