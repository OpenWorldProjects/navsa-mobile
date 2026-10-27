import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api.config';

export function getAutoTheme(now = new Date()) {
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo', hour: '2-digit', hourCycle: 'h23'
  }).format(now));
  return hour >= 7 && hour < 18 ? 'light' : 'dark';
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const mode = localStorage.getItem('navsa_theme_mode');
      if (['auto', 'light', 'dark'].includes(mode)) return mode;
      const saved = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME);
      if (localStorage.getItem('navsa_theme_manual') && ['light', 'dark'].includes(saved)) return saved;
    } catch {}
    return 'auto';
  });
  const [autoTheme, setAutoTheme] = useState(getAutoTheme);
  const theme = themeMode === 'auto' ? autoTheme : themeMode;

  useEffect(() => {
    if (themeMode !== 'auto') return;
    const update = () => setAutoTheme(getAutoTheme());
    const queries = typeof window.matchMedia === 'function'
      ? ['dark', 'light'].map(mode => window.matchMedia(`(prefers-color-scheme: ${mode})`)) : [];
    queries.forEach(query => query.addEventListener?.('change', update));
    const timer = setInterval(update, 30000);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      queries.forEach(query => query.removeEventListener?.('change', update));
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('navsa_theme_mode', themeMode);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME, theme);
      localStorage.removeItem('navsa_theme_manual');
    } catch {}
  }, [theme, themeMode]);

  return { theme, themeMode, setThemeMode };
}
