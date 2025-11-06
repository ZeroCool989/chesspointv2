import { createTheme, ThemeOptions } from '@mui/material/styles';

// Chesspoint "Monarch Knights Set" color palette
const chesspointColors = {
  primary: '#7B5AF0',        // Light purple primary
  primaryLight: '#A78BFA',   // Lighter purple
  primaryDark: '#5B21B6',    // Darker purple
  secondary: '#A78BFA',      // Secondary purple
  surface: '#EDE7FF',        // Light surface
  surfaceDark: '#1B1B1F',    // Dark surface
  textStrong: '#1B1B1F',     // Strong text
  textLight: '#6B7280',      // Light text
  success: '#22C55E',        // Success green
  error: '#EF4444',          // Error red
  warning: '#F59E0B',        // Warning amber
  info: '#3B82F6',           // Info blue
  background: '#FAFAFA',      // Light background
  backgroundDark: '#0F0F0F',  // Dark background
  border: 'rgba(124, 90, 240, 0.15)', // Subtle border
  borderStrong: 'rgba(124, 90, 240, 0.3)', // Stronger border
};

const chesspointTheme: ThemeOptions = {
  palette: {
    mode: 'light', // Default to light mode
    primary: {
      main: chesspointColors.primary,
      light: chesspointColors.primaryLight,
      dark: chesspointColors.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: chesspointColors.secondary,
      light: '#C4B5FD',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    success: {
      main: chesspointColors.success,
      light: '#86EFAC',
      dark: '#16A34A',
    },
    error: {
      main: chesspointColors.error,
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    warning: {
      main: chesspointColors.warning,
      light: '#FCD34D',
      dark: '#D97706',
    },
    info: {
      main: chesspointColors.info,
      light: '#93C5FD',
      dark: '#2563EB',
    },
    background: {
      default: chesspointColors.background,
      paper: chesspointColors.surface,
    },
    text: {
      primary: chesspointColors.textStrong,
      secondary: chesspointColors.textLight,
    },
    divider: chesspointColors.border,
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners (md-xl radius)
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none', // Remove uppercase transformation
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124, 90, 240, 0.15)',
          },
        },
        contained: {
          backgroundColor: chesspointColors.primary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: chesspointColors.primaryDark,
            boxShadow: '0 6px 16px rgba(124, 90, 240, 0.25)',
          },
        },
        outlined: {
          borderColor: chesspointColors.borderStrong,
          color: chesspointColors.primary,
          '&:hover': {
            borderColor: chesspointColors.primary,
            backgroundColor: 'rgba(124, 90, 240, 0.04)',
          },
        },
        text: {
          color: chesspointColors.primary,
          '&:hover': {
            backgroundColor: 'rgba(124, 90, 240, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${chesspointColors.border}`,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: `1px solid ${chesspointColors.border}`,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: chesspointColors.surfaceDark,
          color: '#FFFFFF',
          borderRadius: 8,
          fontSize: '0.875rem',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        arrow: {
          color: chesspointColors.surfaceDark,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          backgroundColor: chesspointColors.primary,
          height: 3,
          borderRadius: '2px 2px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: chesspointColors.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: chesspointColors.primary,
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: chesspointColors.secondary,
          color: '#FFFFFF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: chesspointColors.border,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${chesspointColors.border}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${chesspointColors.border}`,
        },
      },
    },
  },
};

// Create dark mode variant
const chesspointDarkTheme: ThemeOptions = {
  ...chesspointTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: chesspointColors.primary,
      light: chesspointColors.primaryLight,
      dark: chesspointColors.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: chesspointColors.secondary,
      light: '#C4B5FD',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    success: {
      main: chesspointColors.success,
      light: '#86EFAC',
      dark: '#16A34A',
    },
    error: {
      main: chesspointColors.error,
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    warning: {
      main: chesspointColors.warning,
      light: '#FCD34D',
      dark: '#D97706',
    },
    info: {
      main: chesspointColors.info,
      light: '#93C5FD',
      dark: '#2563EB',
    },
    background: {
      default: '#0F0F0F',
      paper: 'rgba(15, 15, 15, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    grey: {
      50: '#0F0F0F',
      100: '#1A1A1A',
      200: '#2A2A2A',
      300: '#3A3A3A',
      400: '#4A4A4A',
      500: '#6A6A6A',
      600: '#8A8A8A',
      700: '#AAAAAA',
      800: '#CACACA',
      900: '#EAEAEA',
    },
  },
  components: {
    ...chesspointTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(15, 15, 15, 0.9)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(15, 15, 15, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124, 90, 240, 0.3)',
          },
        },
        contained: {
          backgroundColor: chesspointColors.primary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: chesspointColors.primaryDark,
            boxShadow: '0 6px 16px rgba(124, 90, 240, 0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: chesspointColors.primary,
          '&:hover': {
            borderColor: chesspointColors.primary,
            backgroundColor: 'rgba(124, 90, 240, 0.1)',
          },
        },
        text: {
          color: chesspointColors.primary,
          '&:hover': {
            backgroundColor: 'rgba(124, 90, 240, 0.1)',
          },
        },
      },
    },
  },
};

export { chesspointTheme, chesspointDarkTheme, chesspointColors };
export default chesspointTheme;
