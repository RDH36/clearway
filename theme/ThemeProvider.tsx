/**
 * Theme system (spec §9). Resolves the active theme from the store's `themePref`
 * + the device scheme (via NativeWind), drives NativeWind's `dark` variant, and
 * exposes the raw token object for code that needs hex (status bar, atmosphere).
 *
 * Dark is the primary theme (design brief §3 / spec §9).
 */
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { themes, type ThemeColors, type ThemeName } from '@/constants/theme';
import { useQuitStore } from '@/store/useQuitStore';

type ThemeContextValue = {
  name: ThemeName;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue>({
  name: 'dark',
  colors: themes.dark,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themePref = useQuitStore((s) => s.themePref);
  const { colorScheme, setColorScheme } = useColorScheme();

  // Keep NativeWind's scheme in sync with the user's preference.
  useEffect(() => {
    setColorScheme(themePref);
  }, [themePref, setColorScheme]);

  // Fall back to dark (the primary theme) until the scheme resolves.
  const name: ThemeName = colorScheme === 'light' ? 'light' : 'dark';

  return (
    <ThemeContext.Provider value={{ name, colors: themes[name] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
