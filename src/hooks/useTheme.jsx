import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return;

    // Default to light mode (no localStorage)
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
  }, [isDark]);

  return { isDark, toggleTheme };
}
