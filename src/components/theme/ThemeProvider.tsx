"use client";

import { useEffect } from "react";
import { useAtom } from 'jotai';
import { themeAtom } from '@/atoms/uiAtoms';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}