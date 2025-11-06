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
      return;
    }

    const newGame = new Chess(puzzle.fen);
    const moves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
    const solutionMoves = moves.slice(1); // Skip first move (opponent's setup)

    // First move is the opponent's setup move - play it automatically
    if (moves.length > 0) {
      const firstMove = moves[0];
      newGame.move({
        from: firstMove.slice(0, 2) as Square,
        to: firstMove.slice(2, 4) as Square,
        promotion: firstMove[4] as 'q' | 'r' | 'b' | 'n' | undefined,
      });
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

    // Use shorter delay for smoother experience
    setTimeout(() => {
      setGame((prevGame) => {
        // Use the ref to get the absolute latest game state
        const latestGame = gameRef.current;
        const latestIndex = currentIndexRef.current;
        const latestSolution = solutionRef.current;

        // Double-check we're still at the right index
        if (latestIndex !== currentIdx || latestIndex >= latestSolution.length) {
          isPlayingOpponentMoveRef.current = false; // Reset flag on mismatch
          return prevGame;
        }

        const newGame = new Chess(latestGame.fen());
        let result;
        try {
          result = newGame.move(moveData);
        } catch (error) {
          console.error('Opponent move failed:', error);
          isPlayingOpponentMoveRef.current = false; // Reset flag on error
          return prevGame;
        }
        
        if (!result) {
          console.error('Failed to play opponent move - illegal move');
          isPlayingOpponentMoveRef.current = false; // Reset flag on failure
          return prevGame;
        }

        const nextIndex = currentIdx + 1;
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        gameRef.current = newGame;

        // Check if checkmate was achieved
        if (newGame.isCheckmate()) {
          isCompleteRef.current = true;
          setIsComplete(true);
          setIsSolved(true);
          isPlayingOpponentMoveRef.current = false; // Reset flag
        } else if (nextIndex >= currentSolution.length) {
          // No more moves - puzzle complete!
          isCompleteRef.current = true;
          setIsComplete(true);
          setIsSolved(true);
          isPlayingOpponentMoveRef.current = false; // Reset flag
        } else {
          // Reset flag after successful move - allows next move in sequence
          setTimeout(() => {
            isPlayingOpponentMoveRef.current = false;
          }, 100);
        }

        return newGame;
      });
    }, 250); // Delay for opponent move (visible but smooth)
  }, [parseUciMove]);

  // Store playOpponentMove in a ref so useEffect can access it reliably
  const playOpponentMoveRef = useRef<(() => void) | null>(null);
  // Flag to prevent double-calling playOpponentMove
  const isPlayingOpponentMoveRef = useRef(false);
  
  useEffect(() => {
    playOpponentMoveRef.current = playOpponentMove;
  }, [playOpponentMove]);

  // Auto-play opponent moves when index changes to an odd number (opponent's turn)
  // This ensures the sequence always works reliably
  useEffect(() => {
    // Skip if puzzle is complete or no solution
    if (isComplete || solution.length === 0) return undefined;
    
    // Check if it's opponent's turn (odd index)
    const isOpponentsTurn = currentIndex % 2 === 1;
    
    if (isOpponentsTurn && currentIndex < solution.length) {
      // Small delay to ensure state is fully updated
      const timeoutId = setTimeout(() => {
        // Double-check state hasn't changed
        const currentIdx = currentIndexRef.current;
        const currentSol = solutionRef.current;
        const isComplete = isCompleteRef.current;

        // Only play if:
        // 1. Puzzle is not complete
        // 2. Index matches (no race condition)
        // 3. Still within solution bounds
        // 4. playOpponentMove function is available
        // 5. Not already playing a move (prevent double-calls)
        if (!isComplete && currentIdx === currentIndex && currentIdx < currentSol.length && playOpponentMoveRef.current && !isPlayingOpponentMoveRef.current) {
          isPlayingOpponentMoveRef.current = true;
          playOpponentMoveRef.current();
          // Note: Flag is reset inside playOpponentMove after move completes
        }
      }, 150); // Slightly longer delay to ensure all state updates complete

      return () => clearTimeout(timeoutId);
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
        // Correct move! Update game state
        try {
          const newIndex = prevIndex + 1;
          
          setGame((prevGame) => {
            // Use ref to get absolute latest game state
            const latestGame = gameRef.current;
            const newGame = new Chess(latestGame.fen());
            
            // Use actual promotion (only if pawn is promoting)
            const piece = latestGame.get(from);
            const isPawn = piece && piece.type === 'p';
            const isLastRank = (to[1] === '8' && piece?.color === 'w') || (to[1] === '1' && piece?.color === 'b');
            const movePromotion = (isPawn && isLastRank) ? (actualPromotion || 'q') : undefined;
            
            let result;
            try {
              result = newGame.move({ from, to, promotion: movePromotion as any });
            } catch (error) {
              console.warn('Move execution failed: invalid move', error, { from, to, promotion: movePromotion, fen: latestGame.fen() });
              return prevGame;
            }

            if (!result) {
              console.warn('Move validation failed: invalid move', { from, to, promotion: movePromotion, fen: latestGame.fen() });
              return prevGame;
            }

            // Update refs immediately - these are synchronous
            currentIndexRef.current = newIndex;
            gameRef.current = newGame;
            setHintSquare(null);
            setHintType(null);
            setHintMove(null);

            // Check if checkmate was achieved
            if (newGame.isCheckmate()) {
              isCompleteRef.current = true;
              setIsComplete(true);
              setIsSolved(true);
              return newGame;
            }

            return newGame;
          });
          
          // Update state - this will trigger useEffect to auto-play opponent move if needed
          setCurrentIndex(newIndex);

          // Check if puzzle is complete
          if (newIndex >= currentSolution.length) {
            // No more moves - puzzle complete!
            isCompleteRef.current = true;
            setIsComplete(true);
            setIsSolved(true);
          } else {
            // Fallback: If it's opponent's turn and flag is not set, ensure opponent move plays
            // This handles edge cases where useEffect might not trigger
            const isOpponentsTurn = newIndex % 2 === 1;
            if (isOpponentsTurn && !isPlayingOpponentMoveRef.current && playOpponentMoveRef.current) {
              // Small delay to let useEffect handle it first, but fallback if needed
              setTimeout(() => {
                const currentIdx = currentIndexRef.current;
                const isComplete = isCompleteRef.current;
                // Only trigger if still opponent's turn and not complete
                if (!isComplete && currentIdx % 2 === 1 && currentIdx < solutionRef.current.length && !isPlayingOpponentMoveRef.current && playOpponentMoveRef.current) {
                  isPlayingOpponentMoveRef.current = true;
                  playOpponentMoveRef.current();
                }
              }, 200); // Slightly longer than useEffect delay to let it try first
            }
          }
          // useEffect will handle opponent moves automatically when currentIndex changes

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

    const newGame = new Chess(puzzle.fen);
    const moves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
    const solutionMoves = moves.slice(1); // Skip first move (opponent's setup)

    // Play first move again (opponent's setup)
    if (moves.length > 0) {
      const firstMove = moves[0];
      try {
        newGame.move({
          from: firstMove.slice(0, 2) as Square,
          to: firstMove.slice(2, 4) as Square,
          promotion: firstMove[4] as 'q' | 'r' | 'b' | 'n' | undefined,
        });
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
      // Reset first
      resetPuzzle();
      
      // Wait for reset to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a fresh game state to simulate the solution
      const solutionGame = new Chess(puzzle.fen);
      const allMoves = puzzle.moves.split(' ').filter((m) => m.trim() !== '');
      
      // Play first move (opponent's setup)
      if (allMoves.length > 0) {
        const firstMove = allMoves[0];
        const firstMoveData = parseUciMove(firstMove);
        solutionGame.move(firstMoveData);
      }
      
      // Play all solution moves
      const solutionMoves = allMoves.slice(1);
      
      for (let i = 0; i < solutionMoves.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Delay between moves
        
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
        
        // Check if puzzle is complete
        if (i + 1 >= solutionMoves.length || solutionGame.isCheckmate()) {
          setIsComplete(true);
          setIsSolved(true);
          break;
        }
      }
    } catch (error) {
      console.error('Error playing solution:', error);
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
