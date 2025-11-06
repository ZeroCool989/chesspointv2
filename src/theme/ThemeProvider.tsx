'use client';

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  createTheme,
} from '@mui/material';
import { colorModeAtom } from '@/state/colorMode';
import { chesspointTheme, chesspointDarkTheme } from './chesspointTheme';

/**
 * Theme Provider with Jotai-powered light/dark mode switching
 * Automatically switches MUI theme based on colorModeAtom
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorMode = useAtomValue(colorModeAtom);

  // Create theme based on current mode
  const theme = useMemo(() => {
    const themeOptions = colorMode === 'dark' ? chesspointDarkTheme : chesspointTheme;
    return createTheme(themeOptions);
  }, [colorMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
