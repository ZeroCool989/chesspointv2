/**
 * Monarch Knights Set - Design Tokens
 * Complete color palette, spacing, and design constants for Chesspoint
 */

export const tokens = {
  // Primary palette
  primary: '#7B5AF0',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#A78BFA',

  // Light mode colors
  light: {
    bg: '#FAFAFA',
    surface: '#EDE7FF',
    panel: 'rgba(255, 255, 255, 0.8)',
    text: '#1B1B1F',
    textMuted: '#6B7280',
    divider: 'rgba(124, 90, 240, 0.15)',
  },

  // Dark mode colors
  dark: {
    bg: '#0F0F0F',
    surface: '#1B1B1F',
    panel: 'rgba(15, 15, 15, 0.9)',
    text: '#FFFFFF',
    textMuted: '#B0B0B0',
    divider: 'rgba(255, 255, 255, 0.1)',
  },

  // Status colors
  success: '#22C55E',
  successLight: '#86EFAC',
  successDark: '#16A34A',

  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',

  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoDark: '#2563EB',

  // Border radii
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  // Blur effect
  blur: '10px',
} as const;

export default tokens;
