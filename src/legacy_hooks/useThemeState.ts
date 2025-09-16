import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import {
  themeAtom
} from '@/store/atoms';

export function useThemeState() {
  const [theme, setTheme] = useAtom(themeAtom);

  // Initialize theme from system preference only on first mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      // Only set theme if it hasn't been set before (check if it's the default value)
      if (theme === 'light') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    }
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