import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getPreferences, savePreferences } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { applyTheme } from '../utils/theme';
import { ThemeContext } from './themeValue';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(null);

  useEffect(() => {
    const loadTheme = () =>
      getPreferences().then(({ theme: savedTheme }) => setThemeState(savedTheme));
    loadTheme().catch(() => setThemeState('system'));
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'preferences') loadTheme().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!theme) return undefined;
    applyTheme(theme);
    if (theme !== 'system') return undefined;
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = () => applyTheme('system');
    media.addEventListener('change', followSystem);
    return () => media.removeEventListener('change', followSystem);
  }, [theme]);

  async function setTheme(nextTheme) {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    try {
      await savePreferences({ theme: nextTheme });
    } catch {
      const preferences = await getPreferences();
      setThemeState(preferences.theme);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme: theme ?? 'system', setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = { children: PropTypes.node.isRequired };
