import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import {
  themeAtom
} from '@/store/atoms';

export function useThemeState() {
  const [theme, setTheme] = useAtom(themeAtom);

  // Initialize theme from system preference only if no theme is set
  useEffect(() => {
    // Only set theme if it hasn't been set before (check if it's the default value)
    if (theme === 'light') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme, theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

// Read-only hooks for optimization
export function useTheme() {
  return useAtomValue(themeAtom);
}

export function useIsDarkMode() {
  const theme = useAtomValue(themeAtom);
  return theme === 'dark';
}