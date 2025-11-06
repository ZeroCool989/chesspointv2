/**
 * Generate a position signature for caching relevance scores and timestamps.
 * Uses pawn structure, king positions, and side to move for a stable signature.
 */
export function positionSignature(fen: string): string {
  const parts = fen.split(' ');
  if (parts.length < 2) return fen;

  const board = parts[0];
  const sideToMove = parts[1];

  // Extract pawn positions (P/p) and king positions (K/k) for signature
  const pawnSignature = board
    .split('')
    .filter(c => c === 'P' || c === 'p')
    .join('');

  const kingSignature = board
    .split('')
    .filter(c => c === 'K' || c === 'k')
    .join('');

  // Combine: side to move + pawn structure + king positions
  return `${sideToMove}:${pawnSignature}:${kingSignature}`;
}
