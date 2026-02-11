import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, AppTheme } from '../theme/themes';

const THEME_KEY = '@lumo_theme';

interface ThemeContextType {
  theme: AppTheme;
  themeId: string;
  setThemeId: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>('darkGradient');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved && themes[saved]) {
        setThemeIdState(saved);
      }
    } catch (e) {
      // Use default
    }
  };

  const setThemeId = async (id: string) => {
    if (themes[id]) {
      setThemeIdState(id);
      await AsyncStorage.setItem(THEME_KEY, id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
