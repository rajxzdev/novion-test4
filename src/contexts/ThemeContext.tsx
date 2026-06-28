'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeName } from '@/types';
import { getSettings, saveSettings } from '@/lib/storage';

interface ThemeContextValue {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');

  useEffect(() => {
    const theme = (getSettings().theme || 'default') as ThemeName;
    setCurrentTheme(theme);
    document.documentElement.dataset.theme = theme;
  }, []);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
    document.documentElement.dataset.theme = theme;
    saveSettings({ theme });
  };

  const value = useMemo(() => ({ currentTheme, setTheme }), [currentTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
