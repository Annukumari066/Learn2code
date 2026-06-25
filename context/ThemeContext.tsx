import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  inputBg: string;
  inputText: string;
  placeholderText: string;

  navBgStart: string;
  navBgEnd: string;
  heroBgStart: string;
  heroBgEnd: string;
  heroText: string;
  heroSubText: string;

  accountContainerBg: string;
  accountCardBg: string;
  accountCardText: string;
  accountProfileBoxBg: string;
  accountMenuBtnBg: string;
  accountMenuText: string;

  loginBg: string;
  loginCardBg: string;
  loginInputBg: string;
  loginLinkText: string;
  loginForgotText: string;

  noteCardBg: string;
  noteCardText: string;
  searchBarBorder: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F7FB',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  accent: '#2563EB',
  inputBg: '#F1F5F9',
  inputText: '#0F172A',
  placeholderText: '#64748B',

  navBgStart: '#05506b',
  navBgEnd: '#007ca5',
  heroBgStart: '#e0fcfd',
  heroBgEnd: '#a1f6ff',
  heroText: '#121e43',
  heroSubText: '#061427',

  accountContainerBg: '#dff6ef',
  accountCardBg: '#0e4b5a',
  accountCardText: '#ffffff',
  accountProfileBoxBg: '#ffffff',
  accountMenuBtnBg: '#eef7f7',
  accountMenuText: '#162548',

  loginBg: '#e8f7f0',
  loginCardBg: 'rgba(255,255,255,0.65)',
  loginInputBg: '#edf4f3',
  loginLinkText: '#1f66d1',
  loginForgotText: '#444444',

  noteCardBg: '#f7fcfb',
  noteCardText: '#18212f',
  searchBarBorder: '#024e56',
};

export const darkColors: ThemeColors = {
  background: '#0b0f19',
  surface: '#1e293b',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  accent: '#3b82f6',
  inputBg: '#1e293b',
  inputText: '#f8fafc',
  placeholderText: '#94a3b8',

  navBgStart: '#1e293b',
  navBgEnd: '#0f172a',
  heroBgStart: '#1e293b',
  heroBgEnd: '#0f172a',
  heroText: '#f8fafc',
  heroSubText: '#cbd5e1',

  accountContainerBg: '#0f172a',
  accountCardBg: '#1e293b',
  accountCardText: '#f8fafc',
  accountProfileBoxBg: '#0f172a',
  accountMenuBtnBg: '#334155',
  accountMenuText: '#cbd5e1',

  loginBg: '#0b0f19',
  loginCardBg: 'rgba(30, 41, 59, 0.8)',
  loginInputBg: '#1e293b',
  loginLinkText: '#60a5fa',
  loginForgotText: '#94a3b8',

  noteCardBg: '#1e293b',
  noteCardText: '#f8fafc',
  searchBarBorder: '#334155',
};

interface ThemeContextProps {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@learn2code_theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (e) {
      console.log('Failed to load theme preference', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const nextTheme = !isDark;
      setIsDark(nextTheme);
      await AsyncStorage.setItem('@learn2code_theme', nextTheme ? 'dark' : 'light');
    } catch (e) {
      console.log('Failed to save theme preference', e);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
