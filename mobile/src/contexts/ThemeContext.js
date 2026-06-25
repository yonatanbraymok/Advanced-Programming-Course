import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode 
      ? {
          background: '#121212',
          surface: '#1e1e1e',
          text: '#ffffff',
          textSecondary: '#aaaaaa',
          primary: '#009de0',
          border: '#333333',
        }
      : {
          background: '#f5f5f5',
          surface: '#ffffff',
          text: '#202125',
          textSecondary: '#707070',
          primary: '#009de0',
          border: '#e0e0e0',
        }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
