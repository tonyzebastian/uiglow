import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return;

    // Check initial theme preference
    const isDarkMode = localStorage.theme === 'dark' ||
      (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.theme = newTheme ? 'dark' : 'light';
  }, [isDark]);

  return { isDark, toggleTheme };
}
