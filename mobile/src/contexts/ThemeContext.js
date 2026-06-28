import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getColors } from '../theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await SecureStore.getItemAsync('isDarkMode');
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'true');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await SecureStore.setItemAsync('isDarkMode', String(newTheme));
  };

  const theme = useMemo(() => {
    const palette = getColors(isDarkMode);
    const colors = {
      ...palette,
      surface: palette.card,
      textSecondary: palette.subtext,
    };

    return {
      isDarkMode,
      toggleTheme,
      colors,
    };
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
