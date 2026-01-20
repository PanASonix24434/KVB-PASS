import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    try {
      // Check for saved theme preference or default to light
      const savedTheme = localStorage.getItem('kvpass-dark-mode');
      if (savedTheme !== null) {
        return JSON.parse(savedTheme);
      }
      // Check system preference as fallback
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch (error) {
      console.error('Error initializing dark mode:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark');
      } else {
        root.setAttribute('data-theme', 'light');
        root.classList.remove('dark');
      }
      
      // Save preference
      localStorage.setItem('kvpass-dark-mode', JSON.stringify(isDark));
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return {
    isDark,
    toggleTheme,
  };
};