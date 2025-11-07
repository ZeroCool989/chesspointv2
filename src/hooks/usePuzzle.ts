import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { Square } from 'react-chessboard/dist/chessboard/types';

export interface Puzzle {
  id: string;
  fen: string;
  moves: string;
  rating: number;
  themes: string[];
  url?: string;
}

export interface PuzzleState {
  game: Chess;
  solution: string[];
  currentIndex: number;
  mistakes: number;
  startTime: number;
  isComplete: boolean;
  isSolved: boolean;
  hintSquare: Square | null;
  hintType: 'move' | 'piece' | null;
  hintMove: { from: Square; to: Square } | null;
}

/**
 * Core puzzle logic hook
 * Handles move validation, auto-play opponent moves, hints, and completion tracking
 */
export function usePuzzle(puzzle: Puzzle | null | undefined) {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [solution, setSolution] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [hintType, setHintType] = useState<'move' | 'piece' | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square } | null>(null);
  const [shakeBoard, setShakeBoard] = useState(false);
  const [mateInX, setMateInX] = useState<number | null>(null);
  const [matingSide, setMatingSide] = useState<'white' | 'black' | null>(null);
  
  // Use refs to access latest values synchronously
  const currentIndexRef = useRef(0);
  const solutionRef = useRef<string[]>([]);
  const isCompleteRef = useRef(false);
  const gameRef = useRef<Chess>(new Chess());
  // Flag to track if solution is being played (prevents opponent moves during solution playback)
  const isPlayingSolutionRef = useRef(false);
  // Flag to prevent double-calling playOpponentMove
  const isPlayingOpponentMoveRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    solutionRef.current = solution;
  }, [solution]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Initialize puzzle when it changes
  useEffect(() => {
    if (!puzzle) {
      setMateInX(null);
      // Reset solution playback flag
      isPlayingSolutionRef.current = false;
      return;
    }

    // Reset solution playback flag when puzzle changes
    isPlayingSolutionRef.current = false;

    const newGame = new Chess(puzzle.fen);
    const moves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
    const solutionMoves = moves.slice(1); // Skip first move (opponent's setup)

    // First move is the opponent's setup move - play it automatically
    if (moves.length > 0) {
      const firstMove = moves[0];
      try {
        const result = newGame.move({
          from: firstMove.slice(0, 2) as Square,
          to: firstMove.slice(2, 4) as Square,
          promotion: firstMove[4] as 'q' | 'r' | 'b' | 'n' | undefined,
        });
        if (!result) {
          console.error('Failed to play first move in puzzle initialization');
        }
      } catch (error) {
        console.error('Error playing first move in puzzle initialization:', error);
      }
    }

    // Set initial state immediately (don't wait for mate calculation)
    setGame(newGame);
    setSolution(solutionMoves);
    
    // Determine mating side from initial position (synchronous, fast)
    let determinedMatingSide: 'white' | 'black' | null = null;
    if (newGame) {
      const turnAfterFirstMove = newGame.turn();
      // If it's white's turn after first move, player (who will mate) is white
      // If it's black's turn after first move, player (who will mate) is black
      determinedMatingSide = turnAfterFirstMove === 'w' ? 'white' : 'black';
    }
    setMatingSide(determinedMatingSide);
    
    // Calculate mate in X from solution length (no chess.js calculation needed!)
    // Solution moves alternate: player (index 0), opponent (index 1), player (index 2), etc.
    // Assuming checkmate happens at the end of the solution (typical for puzzles)
    // Player moves are at even indices: 0, 2, 4, 6...
    // Formula: Math.ceil(solution.length / 2) gives number of player moves
    let calculatedMateInX: number | null = null;
    
    if (solutionMoves.length > 0) {
      // Count player moves: even indices (0, 2, 4...) are player moves
      // If solution has N moves, player moves = Math.ceil(N / 2)
      // Examples:
      // - 4 moves (indices 0,1,2,3): player moves at 0,2 = 2 moves = Math.ceil(4/2) = 2
      // - 5 moves (indices 0,1,2,3,4): player moves at 0,2,4 = 3 moves = Math.ceil(5/2) = 3
      calculatedMateInX = Math.ceil(solutionMoves.length / 2);
    }
    
    // Set mateInX immediately - instant, no calculation needed!
    setMateInX(calculatedMateInX);
    setCurrentIndex(0);
    setMistakes(0);
    setStartTime(Date.now());
    setIsComplete(false);
    setIsSolved(false);
    setHintSquare(null);
    setHintType(null);
    setHintMove(null);
    setShakeBoard(false);
    
    // Update refs to match initial state
    currentIndexRef.current = 0;
    solutionRef.current = solutionMoves;
    isCompleteRef.current = false;
    gameRef.current = newGame;
  }, [puzzle]);

  // Parse UCI move to chess.js move format
  const parseUciMove = useCallback(
    (uci: string) => {
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promotion = uci[4] as 'q' | 'r' | 'b' | 'n' | undefined;

      return { from, to, promotion };
    },
    []
  );

  // Auto-play opponent move
  const playOpponentMove = useCallback(() => {
    // Don't play if solution is being played
    if (isPlayingSolutionRef.current) {
      isPlayingOpponentMoveRef.current = false;
      return;
    }

    // Use refs to get latest values synchronously
    const currentIdx = currentIndexRef.current;
    const currentSolution = solutionRef.current;

    if (currentIdx >= currentSolution.length) {
      isPlayingOpponentMoveRef.current = false; // Reset flag
      return;
    }

    const expectedMove = currentSolution[currentIdx];
    if (!expectedMove) {
      console.error('playOpponentMove: No move found at index', currentIdx);
      isPlayingOpponentMoveRef.current = false; // Reset flag
      return;
    }

    const moveData = parseUciMove(expectedMove);

    // Use requestAnimationFrame for smooth, immediate response
    // This runs before the next paint, making it feel instant
    requestAnimationFrame(() => {
      // Check again if solution is being played (might have changed)
      if (isPlayingSolutionRef.current) {
        isPlayingOpponentMoveRef.current = false;
        return;
      }

      // Get latest state from refs (always up-to-date)
      const latestGame = gameRef.current;
      const latestIndex = currentIndexRef.current;
      const latestSolution = solutionRef.current;

      // Double-check we're still at the right index and solution hasn't changed
      if (latestIndex !== currentIdx || latestIndex >= latestSolution.length || isPlayingSolutionRef.current) {
        isPlayingOpponentMoveRef.current = false; // Reset flag on mismatch
        return;
      }

      // Execute move synchronously
      const newGame = new Chess(latestGame.fen());
      let result;
      try {
        result = newGame.move(moveData);
      } catch (error) {
        console.error('Opponent move failed:', error);
        isPlayingOpponentMoveRef.current = false; // Reset flag on error
        return;
      }
      
      if (!result) {
        console.error('Failed to play opponent move - illegal move');
        isPlayingOpponentMoveRef.current = false; // Reset flag on failure
        return;
      }

      const nextIndex = currentIdx + 1;
      
      // Update refs immediately (synchronous)
      currentIndexRef.current = nextIndex;
      gameRef.current = newGame;

      // Check if puzzle is complete
      const isPuzzleComplete = newGame.isCheckmate() || nextIndex >= currentSolution.length;
      
      if (isPuzzleComplete) {
        isCompleteRef.current = true;
        setIsComplete(true);
        setIsSolved(true);
      }
      
      // Batch state updates together
      setGame(newGame);
      setCurrentIndex(nextIndex);
      
      // Reset flag immediately after successful move
      isPlayingOpponentMoveRef.current = false;
    });
  }, [parseUciMove]);

  // Store playOpponentMove in a ref so useEffect can access it reliably
  const playOpponentMoveRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    playOpponentMoveRef.current = playOpponentMove;
  }, [playOpponentMove]);

  // Auto-play opponent moves when index changes to an odd number (opponent's turn)
  // Optimized for immediate response - no nested timeouts
  useEffect(() => {
    // Skip if puzzle is complete or no solution
    if (isComplete || solution.length === 0) return undefined;
    
    // Check if it's opponent's turn (odd index)
    const isOpponentsTurn = currentIndex % 2 === 1;
    
    if (isOpponentsTurn && currentIndex < solution.length) {
      // Use requestAnimationFrame for smooth timing (runs before next paint)
      const rafId = requestAnimationFrame(() => {
        // Double-check state using refs (most up-to-date, no stale closures)
        const currentIdx = currentIndexRef.current;
        const currentSol = solutionRef.current;
        const isComplete = isCompleteRef.current;

        // Only play if:
        // 1. Puzzle is not complete
        // 2. Index matches (no race condition) - use ref value for accuracy
        // 3. Still within solution bounds
        // 4. playOpponentMove function is available
        // 5. Not already playing a move (prevent double-calls)
        // 6. Not playing solution
        if (!isComplete && 
            !isPlayingSolutionRef.current &&
            currentIdx % 2 === 1 && 
            currentIdx < currentSol.length && 
            playOpponentMoveRef.current && 
            !isPlayingOpponentMoveRef.current) {
          isPlayingOpponentMoveRef.current = true;
          playOpponentMoveRef.current();
          // Note: Flag is reset inside playOpponentMove after move completes
        }
      });

      return () => {
        cancelAnimationFrame(rafId);
      };
    }
    
    return undefined;
  }, [currentIndex, isComplete, solution.length]);

  // Validate user move
  const validateMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      // Use refs to get latest values synchronously
      const prevIndex = currentIndexRef.current;
      const currentSolution = solutionRef.current;
      const completed = isCompleteRef.current;
      
      // First, check current state synchronously
      if (completed) {
        return false;
      }
      
      // Check if we've reached the end of the solution
      if (prevIndex >= currentSolution.length) {
        return false;
      }

      // Check if it's player's turn (even indices are player moves)
      const isPlayerTurn = prevIndex % 2 === 0;
      if (!isPlayerTurn) {
        // Not player's turn - opponent should auto-play
        return false;
      }

      // Build UCI string from move
      const currentGame = gameRef.current;
      const piece = currentGame.get(from);
      const isPawn = piece && piece.type === 'p';
      const isLastRank = (to[1] === '8' && piece?.color === 'w') || (to[1] === '1' && piece?.color === 'b');
      
      // Only include promotion if pawn is actually promoting
      // If promotion is provided and valid, use it; otherwise default to 'q' for pawn promotion
      let actualPromotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;
      if (isPawn && isLastRank) {
        if (promotion && ['q', 'r', 'b', 'n'].includes(promotion.toLowerCase())) {
          actualPromotion = promotion.toLowerCase() as 'q' | 'r' | 'b' | 'n';
        } else {
          // Default to queen if no valid promotion specified
          actualPromotion = 'q';
        }
      }
      
      const uciMove = `${from}${to}${actualPromotion ? actualPromotion : ''}`;
      const expectedMove = currentSolution[prevIndex];

      // Check if move matches expected solution
      // Try exact match first
      let moveMatches = uciMove === expectedMove;
      
      // If exact match fails, try without promotion
      if (!moveMatches && actualPromotion) {
        const moveWithoutPromotion = `${from}${to}`;
        moveMatches = moveWithoutPromotion === expectedMove || 
          (moveWithoutPromotion === expectedMove.slice(0, 4) && expectedMove.length === 4);
      }
      
      // Also try with promotion if expected move has it
      if (!moveMatches && !actualPromotion && expectedMove.length === 5) {
        const moveWithPromotion = `${from}${to}${expectedMove[4].toLowerCase()}`;
        moveMatches = moveWithPromotion === expectedMove;
      }
      
      // If exact match fails, try to validate the move by comparing resulting positions
      if (!moveMatches && expectedMove) {
        try {
          // Get current game state from ref
          const currentGame = gameRef.current;
          
          // Try the user's move with the correct promotion
          const testGame = new Chess(currentGame.fen());
          const testMove = testGame.move({ from, to, promotion: actualPromotion as any });
          
          if (testMove) {
            // Move is valid, now check if it matches the expected move in the solution
            const expectedFrom = expectedMove.slice(0, 2) as Square;
            const expectedTo = expectedMove.slice(2, 4) as Square;
            const expectedPromotion = expectedMove[4] as 'q' | 'r' | 'b' | 'n' | undefined;
            
            // Try the expected move
            const expectedTestGame = new Chess(currentGame.fen());
            const expectedTestMove = expectedTestGame.move({
              from: expectedFrom,
              to: expectedTo,
              promotion: expectedPromotion,
            });
            
            // If both moves result in the same position, they're equivalent
            if (expectedTestMove && testGame.fen() === expectedTestGame.fen()) {
              moveMatches = true;
              console.log('Move matches by position comparison:', {
                userMove: uciMove,
                expectedMove,
                resultingFen: testGame.fen(),
              });
            }
          } else {
            // Move is invalid - don't try to match it
            console.warn('User move is invalid in current position:', {
              from,
              to,
              actualPromotion,
              fen: currentGame.fen(),
            });
          }
        } catch (error) {
          // Move is invalid - catch any errors and don't match it
          console.warn('Error validating move by position comparison:', error, {
            from,
            to,
            actualPromotion,
            expectedMove,
          });
        }
      }

      if (moveMatches) {
        // Correct move! Update game state synchronously
        try {
          // Get latest game state from ref (always up-to-date)
          const latestGame = gameRef.current;
          const newGame = new Chess(latestGame.fen());
          
          // Use actual promotion (only if pawn is promoting)
          const piece = latestGame.get(from);
          const isPawn = piece && piece.type === 'p';
          const isLastRank = (to[1] === '8' && piece?.color === 'w') || (to[1] === '1' && piece?.color === 'b');
          const movePromotion = (isPawn && isLastRank) ? (actualPromotion || 'q') : undefined;
          
          // Execute move synchronously
          let result;
          try {
            result = newGame.move({ from, to, promotion: movePromotion as any });
          } catch (error) {
            console.warn('Move execution failed: invalid move', error, { from, to, promotion: movePromotion, fen: latestGame.fen() });
            setMistakes((prev) => prev + 1);
            return false;
          }

          if (!result) {
            console.warn('Move validation failed: invalid move', { from, to, promotion: movePromotion, fen: latestGame.fen() });
            setMistakes((prev) => prev + 1);
            return false;
          }

          // Calculate new index
          const newIndex = prevIndex + 1;
          
          // Update refs immediately (synchronous, no delays)
          currentIndexRef.current = newIndex;
          gameRef.current = newGame;
          
          // Check if puzzle is complete
          const isPuzzleComplete = newIndex >= currentSolution.length || newGame.isCheckmate();
          
          // Batch all state updates together using React.startTransition for better performance
          // This ensures all updates happen in a single render cycle
          if (isPuzzleComplete) {
            isCompleteRef.current = true;
            setIsComplete(true);
            setIsSolved(true);
          }
          
          // Update game state and index together
          setGame(newGame);
          setCurrentIndex(newIndex);
          
          // Clear hints
          setHintSquare(null);
          setHintType(null);
          setHintMove(null);

          // Opponent move will be triggered automatically by useEffect when currentIndex changes
          // No need for fallback setTimeout - useEffect handles it reliably

          return true;
        } catch (error) {
          // Move execution failed
          console.error('Error executing move:', error);
          setMistakes((prev) => prev + 1);
          return false;
        }
      } else {
        // Wrong move - reject it
        setMistakes((prev) => prev + 1);
        return false;
      }
    },
    [playOpponentMove]
  );

  // Show hint (move or piece)
  const showHint = useCallback((type: 'move' | 'piece' = 'move') => {
    if (currentIndex >= solution.length) return;

    const expectedMove = solution[currentIndex];
    if (!expectedMove) return;

    const from = expectedMove.slice(0, 2) as Square;
    const to = expectedMove.slice(2, 4) as Square;

    if (type === 'move') {
      // Show move hint - highlight both origin and destination
      setHintSquare(to); // Also set hintSquare for compatibility
      setHintType('move');
      setHintMove({ from, to }); // Store full move for highlighting both squares
    } else {
      // Show piece hint - highlight the from square
      setHintSquare(from);
      setHintType('piece');
      setHintMove(null); // No move for piece hint
    }
  }, [solution, currentIndex]);

  // Reset puzzle to initial state
  const resetPuzzle = useCallback(() => {
    if (!puzzle) return;

    // Reset solution playback flag
    isPlayingSolutionRef.current = false;
    isPlayingOpponentMoveRef.current = false;

    const newGame = new Chess(puzzle.fen);
    const moves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
    const solutionMoves = moves.slice(1); // Skip first move (opponent's setup)

    // Play first move again (opponent's setup)
    if (moves.length > 0) {
      const firstMove = moves[0];
      try {
        const result = newGame.move({
          from: firstMove.slice(0, 2) as Square,
          to: firstMove.slice(2, 4) as Square,
          promotion: firstMove[4] as 'q' | 'r' | 'b' | 'n' | undefined,
        });
        if (!result) {
          console.error('Failed to play first move in reset');
        }
      } catch (error) {
        console.error('Error playing first move in reset:', error);
      }
    }

    // Update all state
    setGame(newGame);
    setSolution(solutionMoves);
    setCurrentIndex(0);
    setMistakes(0);
    setStartTime(Date.now());
    setIsComplete(false);
    setIsSolved(false);
    setHintSquare(null);
    setHintType(null);
    setHintMove(null);
    setShakeBoard(false);
    
    // Update refs to match reset state - this is critical for the sequence to work
    currentIndexRef.current = 0;
    solutionRef.current = solutionMoves;
    isCompleteRef.current = false;
    gameRef.current = newGame;
  }, [puzzle]);

  // Get elapsed time in ms
  const elapsedTime = useMemo(() => {
    if (isComplete) return Date.now() - startTime;
    return 0;
  }, [isComplete, startTime]);

  // Get total moves tried
  const movesTried = useMemo(() => {
    return currentIndex + mistakes;
  }, [currentIndex, mistakes]);

  // mateInX is now calculated once when puzzle is initialized and stored in state

  // Play solution automatically
  const playSolution = useCallback(async () => {
    if (!puzzle) return;
    
    try {
      // Set flag to prevent opponent moves during solution playback
      isPlayingSolutionRef.current = true;
      
      // Reset first
      resetPuzzle();
      
      // Wait for reset to complete (reduced delay)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create a fresh game state to simulate the solution
      const solutionGame = new Chess(puzzle.fen);
      const allMoves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
      
      // Play first move (opponent's setup)
      if (allMoves.length > 0) {
        const firstMove = allMoves[0];
        const firstMoveData = parseUciMove(firstMove);
        const result = solutionGame.move(firstMoveData);
        if (!result) {
          console.warn('Invalid first move in solution');
          isPlayingSolutionRef.current = false;
          return;
        }
        // Update game state immediately
        setGame(new Chess(solutionGame.fen()));
      }
      
      // Play all solution moves
      const solutionMoves = allMoves.slice(1);
      
      for (let i = 0; i < solutionMoves.length; i++) {
        // Check if solution playback was interrupted
        if (!isPlayingSolutionRef.current) {
          break;
        }
        
        // Reduced delay for smoother playback
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Check again after delay
        if (!isPlayingSolutionRef.current) {
          break;
        }
        
        const move = solutionMoves[i];
        const moveData = parseUciMove(move);
        
        // Play the move
        const result = solutionGame.move(moveData);
        if (!result) {
          console.warn(`Invalid move at index ${i}: ${move}`);
          break;
        }
        
        // Update the game state
        setGame(new Chess(solutionGame.fen()));
        setCurrentIndex(i + 1);
        currentIndexRef.current = i + 1;
        gameRef.current = new Chess(solutionGame.fen());
        
        // Check if puzzle is complete
        if (i + 1 >= solutionMoves.length || solutionGame.isCheckmate()) {
          isCompleteRef.current = true;
          setIsComplete(true);
          setIsSolved(true);
          break;
        }
      }
      
      // Reset flag after solution playback completes
      isPlayingSolutionRef.current = false;
    } catch (error) {
      console.error('Error playing solution:', error);
      isPlayingSolutionRef.current = false;
    }
  }, [puzzle, resetPuzzle, parseUciMove]);

  // Get current turn
  const currentTurn = useMemo(() => {
    if (!game || isComplete) return null;
    return game.turn() === 'w' ? 'white' : 'black';
  }, [game, isComplete]);

  // Clear hints (for clearing arrows)
  const clearHints = useCallback(() => {
    setHintSquare(null);
    setHintType(null);
    setHintMove(null);
  }, []);

  return {
    game,
    solution,
    currentIndex,
    mistakes,
    isComplete,
    isSolved,
    hintSquare,
    hintType,
    hintMove,
    shakeBoard,
    elapsedTime,
    movesTried,
    mateInX,
    currentTurn,
    matingSide,
    validateMove,
    showHint,
    clearHints,
    resetPuzzle,
    playSolution,
  };
}

export default usePuzzle;
