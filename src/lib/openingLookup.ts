/**
 * Opening detection utilities using position-based keys.
 * Matches by piece placement + side to move (ignores castling, ep, clocks).
 */

import { openings } from "@/data/openings";

export interface OpeningData {
  name: string;
  eco?: string;
}

/**
 * Extract a stable position key from FEN.
 * Format: "pieces turn" (ignores castling, en passant, halfmove, fullmove)
 *
 * Example:
 * Full FEN: "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq - 0 1"
 * Position key: "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b"
 */
export function positionKeyFromFen(fen: string): string {
  const parts = fen.split(' ');
  if (parts.length < 2) return fen;

  const pieces = parts[0]; // Board position
  const turn = parts[1];    // Side to move (w/b)

  return `${pieces} ${turn}`;
}

/**
 * Normalize FEN to a canonical form (useful for engine analysis).
 * Sets castling/ep/clocks to neutral values.
 */
export function normalizeFen(fen: string): string {
  const [pieces, turn] = fen.split(' ');
  return `${pieces} ${turn} - - 0 1`;
}

/**
 * Build opening index from data.
 * Creates two maps:
 * 1. By position key (pieces + turn)
 * 2. By pieces only (fallback for data that omits turn)
 */
class OpeningIndex {
  private byPositionKey = new Map<string, OpeningData>();
  private byPiecesOnly = new Map<string, OpeningData>();

  constructor() {
    this.buildIndex();
  }

  private buildIndex() {
    for (const opening of openings) {
      const { name, fen } = opening;

      // Parse existing FEN (some entries may have turn, some may not)
      const parts = fen.split(' ');
      const pieces = parts[0];
      const turn = parts[1] || 'w'; // Default to white if missing

      // Store with turn
      const keyWithTurn = `${pieces} ${turn}`;
      if (!this.byPositionKey.has(keyWithTurn)) {
        this.byPositionKey.set(keyWithTurn, { name });
      }

      // Store without turn (fallback)
      if (!this.byPiecesOnly.has(pieces)) {
        this.byPiecesOnly.set(pieces, { name });
      }
    }

    console.log(`Opening index built: ${this.byPositionKey.size} positions (with turn), ${this.byPiecesOnly.size} positions (pieces only)`);
  }

  /**
   * Look up opening by FEN.
   * Strategy:
   * 1. Try exact match (pieces + turn)
   * 2. Fall back to pieces-only match
   * 3. Return null if not found
   */
  public lookup(fen: string): OpeningData | null {
    const key = positionKeyFromFen(fen);

    // Try exact match
    const exact = this.byPositionKey.get(key);
    if (exact) return exact;

    // Fallback: pieces only (for data without turn marker)
    const pieces = fen.split(' ')[0];
    const fallback = this.byPiecesOnly.get(pieces);
    if (fallback) return fallback;

    return null;
  }

  /**
   * Search backwards through move history to find the last known opening.
   */
  public lookupFromHistory(moveHistory: { after: string }[]): string | null {
    // Search in reverse (most recent moves first)
    for (let i = moveHistory.length - 1; i >= 0; i--) {
      const move = moveHistory[i];
      const opening = this.lookup(move.after);
      if (opening) {
        return opening.name;
      }
    }
    return null;
  }
}

// Singleton instance
export const openingIndex = new OpeningIndex();
