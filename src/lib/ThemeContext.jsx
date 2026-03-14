import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'day', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('litlearn-theme') || 'day';
  });

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('litlearn-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ─── Theme tokens ─────────────────────────────────────────────
export const THEMES = {
  day: {
    bg:          '#EAE7DA',
    headerBg:    'rgba(208,204,188,0.65)',
    cardBg:      '#D8D4C6',
    cardBg2:     '#E0DDD0',
    textPrimary: '#414323',
    textMuted:   'rgba(65,67,35,0.55)',
    navBg:       '#ADB684',
    trunkDark:   '#2E2F18',
    trunkMid:    '#414323',
    leafLight:   '#D4E4A0',
    leafMid:     '#ADB684',
    leafDark:    '#6A8040',
    skyTop:      '#EAE7DA',
    skyBottom:   '#EAE7DA',
    name:        'Day',
  },
  night: {
    bg:          '#0F1A2E',
    headerBg:    'rgba(15,26,46,0.92)',
    cardBg:      '#1A2840',
    cardBg2:     '#162038',
    textPrimary: '#E8EFF8',
    textMuted:   'rgba(180,200,230,0.6)',
    navBg:       '#1E3050',
    trunkDark:   '#080E18',
    trunkMid:    '#0D1520',
    leafLight:   '#1A2840',
    leafMid:     '#0F1A2E',
    leafDark:    '#080E18',
    skyTop:      '#0A1428',
    skyBottom:   '#0F1A2E',
    name:        'Night',
  },
};
