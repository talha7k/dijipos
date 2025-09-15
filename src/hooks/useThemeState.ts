import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import {
  themeAtom
} from '@/store/atoms';

export function useThemeState() {
  const [theme, setTheme] = useAtom(themeAtom);

  // Initialize theme from system preference on mount (IndexedDB will handle persistence)
  useEffect(() => {
    // Default to system preference if no theme is set
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, [setTheme]);

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