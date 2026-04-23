import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { changeThemeColor, initializeTheme } from '../utils/materialTheme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check localStorage first (always prioritize saved preference)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    return defaultTheme;
  });

  // Initialize Material theme on mount
  useEffect(() => {
    initializeTheme('#0ea5e9'); // Primary color
  }, []);

  // Update localStorage and document when theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply Material theme
    const isDark = theme === 'dark';
    const seedColor = localStorage.getItem('seed-color') || '#0ea5e9';
    changeThemeColor(seedColor, isDark);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
