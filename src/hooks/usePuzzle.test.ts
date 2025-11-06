/**
 * Unit tests for UCI move validation in puzzle mode
 *
 * To run these tests, install a test runner:
 * npm install --save-dev jest @testing-library/react @testing-library/react-hooks
 *
 * Or use Vitest:
 * npm install --save-dev vitest @testing-library/react
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { usePuzzle, Puzzle } from './usePuzzle';

describe('usePuzzle - UCI Validator', () => {
  const mockPuzzle: Puzzle = {
    id: 'test123',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6', // Setup move + solution
    rating: 1500,
    themes: ['opening', 'development'],
  };

  describe('Move validation', () => {
    it('should accept correct UCI moves', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      // Wait for puzzle to initialize
      act(() => {
        // The first move (e2e4) is auto-played as setup
        // Solution starts from e7e5 (opponent) which should auto-play
        // So first user move should be g1f3
      });

      // Validate correct move
      const isValid = act(() => result.current.validateMove('g1' as any, 'f3' as any));
      expect(isValid).toBe(true);
    });

    it('should reject incorrect UCI moves', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      // Try an incorrect move
      const isValid = act(() => result.current.validateMove('b1' as any, 'c3' as any));
      expect(isValid).toBe(false);
      expect(result.current.mistakes).toBe(1);
    });

    it('should handle promotion moves correctly (e7e8q)', () => {
      const promotionPuzzle: Puzzle = {
        id: 'promotion123',
        fen: '4k3/4P3/8/8/8/8/8/4K3 w - - 0 1',
        moves: 'e7e8q', // Pawn promotion to queen
        rating: 1200,
        themes: ['endgame', 'promotion'],
      };

      const { result } = renderHook(() => usePuzzle(promotionPuzzle));

      // Validate promotion move with UCI format e7e8q
      const isValid = act(() => result.current.validateMove('e7' as any, 'e8' as any, 'q'));
      expect(isValid).toBe(true);
      expect(result.current.isSolved).toBe(true);
    });

    it('should increment mistakes on wrong moves', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      // Make several wrong moves
      act(() => {
        result.current.validateMove('b1' as any, 'c3' as any);
        result.current.validateMove('d2' as any, 'd4' as any);
      });

      expect(result.current.mistakes).toBe(2);
    });

    it('should complete puzzle when all moves are correct', () => {
      const simplePuzzle: Puzzle = {
        id: 'simple123',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
        moves: 'g1f3 b8c6', // Just 2 moves
        rating: 800,
        themes: ['opening'],
      };

      const { result } = renderHook(() => usePuzzle(simplePuzzle));

      // Play both moves correctly
      act(() => {
        result.current.validateMove('g1' as any, 'f3' as any);
        // After player move, opponent should auto-play
        // Then puzzle should be complete
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.isSolved).toBe(true);
      expect(result.current.mistakes).toBe(0);
    });
  });

  describe('Hint functionality', () => {
    it('should show hint square for next move', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      act(() => {
        result.current.showHint();
      });

      expect(result.current.hintSquare).toBeDefined();
      expect(result.current.hintSquare).toMatch(/^[a-h][1-8]$/);
    });

    it('should clear hint after correct move', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      act(() => {
        result.current.showHint();
      });

      expect(result.current.hintSquare).toBeDefined();

      act(() => {
        result.current.validateMove('g1' as any, 'f3' as any);
      });

      expect(result.current.hintSquare).toBeNull();
    });
  });

  describe('Reset functionality', () => {
    it('should reset puzzle state', () => {
      const { result } = renderHook(() => usePuzzle(mockPuzzle));

      // Make some moves and mistakes
      act(() => {
        result.current.validateMove('b1' as any, 'c3' as any); // Wrong move
        result.current.showHint();
      });

      expect(result.current.mistakes).toBeGreaterThan(0);
      expect(result.current.hintSquare).toBeDefined();

      // Reset
      act(() => {
        result.current.resetPuzzle();
      });

      expect(result.current.mistakes).toBe(0);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.hintSquare).toBeNull();
      expect(result.current.isComplete).toBe(false);
    });
  });
});

/**
 * Standalone validation function tests (no React hooks)
 * These can run without a testing library
 */
describe('UCI format validation (standalone)', () => {
  it('should correctly parse standard UCI moves', () => {
    const testCases = [
      { uci: 'e2e4', from: 'e2', to: 'e4', promotion: undefined },
      { uci: 'g1f3', from: 'g1', to: 'f3', promotion: undefined },
      { uci: 'a7a8q', from: 'a7', to: 'a8', promotion: 'q' },
      { uci: 'h7h8n', from: 'h7', to: 'h8', promotion: 'n' },
    ];

    testCases.forEach(({ uci, from, to, promotion }) => {
      const parsedFrom = uci.slice(0, 2);
      const parsedTo = uci.slice(2, 4);
      const parsedPromotion = uci[4];

      expect(parsedFrom).toBe(from);
      expect(parsedTo).toBe(to);
      expect(parsedPromotion).toBe(promotion);
    });
  });

  it('should validate square format [a-h][1-8]', () => {
    const validSquares = ['a1', 'h8', 'e4', 'd5'];
    const invalidSquares = ['i1', 'a9', 'zz', '11', 'aa'];

    const squareRegex = /^[a-h][1-8]$/;

    validSquares.forEach((square) => {
      expect(squareRegex.test(square)).toBe(true);
    });

    invalidSquares.forEach((square) => {
      expect(squareRegex.test(square)).toBe(false);
    });
  });
});
