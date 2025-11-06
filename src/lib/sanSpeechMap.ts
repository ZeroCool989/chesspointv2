/**
 * Maps SAN notation to spoken/written variations for matching in video captions.
 * Used to search transcripts for move discussions.
 */

export const sanToSpeech: Record<string, string[]> = {
  // Castling
  'O-O': ['castle short', 'kingside castle', 'castles kingside', 'king side castle'],
  'O-O-O': ['castle long', 'queenside castle', 'castles queenside', 'queen side castle'],

  // Piece names (for compound matching)
  'N': ['knight', 'n'],
  'B': ['bishop', 'b'],
  'R': ['rook', 'r'],
  'Q': ['queen', 'q'],
  'K': ['king', 'k'],
};

/**
 * Convert a SAN move to possible spoken variations.
 * Examples:
 *   Nf3 -> ["knight f three", "n f three", "knight f 3"]
 *   Bxc4 -> ["bishop takes c four", "bishop takes c 4", "b takes c four"]
 *   e4 -> ["e four", "e 4", "pawn e four"]
 */
export function sanToSpokenVariations(san: string): string[] {
  const variations: string[] = [];

  // Remove check/mate symbols
  const cleanSan = san.replace(/[+#!?]/g, '');

  // Castling
  if (cleanSan === 'O-O' || cleanSan === 'O-O-O') {
    return sanToSpeech[cleanSan] || [];
  }

  // Extract parts: piece, capture, destination
  const match = cleanSan.match(/^([NBRQK])?([a-h])?([1-8])?(x)?([a-h][1-8])(=[NBRQ])?$/);

  if (!match) {
    // Fallback: just return lowercase version
    variations.push(cleanSan.toLowerCase());
    return variations;
  }

  const piece = match[1] || 'P'; // Pawn if no piece specified
  const captureFile = match[2];
  const captureRank = match[3];
  const capture = match[4];
  const destination = match[5];
  const promotion = match[6];

  const destFile = destination[0];
  const destRank = destination[1];

  const pieceNames = piece === 'P'
    ? ['pawn', '']
    : (sanToSpeech[piece] || [piece.toLowerCase()]);

  const captureWords = capture ? ['takes', 'captures', 'x'] : ['to', ''];

  const rankWords = [
    destRank,
    ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][parseInt(destRank)] || destRank
  ];

  // Generate combinations
  pieceNames.forEach(pieceName => {
    captureWords.forEach(captureWord => {
      rankWords.forEach(rankWord => {
        const parts = [
          pieceName,
          captureFile || '',
          captureWord,
          destFile,
          rankWord
        ].filter(p => p !== '');

        variations.push(parts.join(' ').trim());
      });
    });
  });

  return variations.map(v => v.toLowerCase().replace(/\s+/g, ' ').trim());
}

/**
 * Search for a move in a transcript text.
 * Returns true if any spoken variation is found.
 */
export function findMoveInText(san: string, text: string): boolean {
  const variations = sanToSpokenVariations(san);
  const lowerText = text.toLowerCase();

  return variations.some(variation => lowerText.includes(variation));
}
