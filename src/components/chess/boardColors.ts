/**
 * Themed chessboard square colors for Monarch Knights Set
 * Provides light and dark mode color schemes for the board
 */

export const boardColors = {
  light: {
    lightSquare: '#EDE7FF',   // Light purple surface
    darkSquare: '#BBAEF8',    // Medium purple
    highlightLastMove: 'rgba(124, 90, 240, 0.35)',
    highlightLegal: 'rgba(124, 90, 240, 0.25)',
    highlightCapture: 'rgba(239, 68, 68, 0.35)',
  },
  dark: {
    lightSquare: '#2A2348',   // Dark mode light squares
    darkSquare: '#1D1833',    // Dark mode dark squares
    highlightLastMove: 'rgba(167, 139, 250, 0.4)',
    highlightLegal: 'rgba(167, 139, 250, 0.3)',
    highlightCapture: 'rgba(239, 68, 68, 0.4)',
  },
} as const;

export default boardColors;
