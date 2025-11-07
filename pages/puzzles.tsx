import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Container, Grid2 as Grid, Typography, Card } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ThemedBoard } from '@/components/chess/ThemedBoard';
import { PuzzleSidebar, PuzzleFilters } from '@/components/puzzles/PuzzleSidebar';
import { usePuzzle, Puzzle } from '@/hooks/usePuzzle';
import { Square } from 'react-chessboard/dist/chessboard/types';
import EngineSettingsButton from '@/sections/engineSettings/engineSettingsButton';
import { useDebounce } from '@/hooks/useDebounce';

// API functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

async function fetchRandomPuzzle(filters: PuzzleFilters): Promise<Puzzle> {
  const params = new URLSearchParams({
    minRating: filters.minRating.toString(),
    maxRating: filters.maxRating.toString(),
  });

  if (filters.theme) {
    params.append('theme', filters.theme);
  }

  const url = `${API_BASE}/api/puzzles/random?${params}`;
  console.log('Fetching puzzle from:', url);

  try {
    // Create AbortController for timeout (more compatible than AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch puzzle:', response.status, errorText);
      throw new Error(`Failed to fetch puzzle: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Puzzle data:', data);
    return data;
  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout - please check your internet connection');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error - please check your internet connection and ensure the backend is running');
      }
      throw error;
    }
    throw new Error('Unknown error occurred while fetching puzzle');
  }
}

async function fetchThemes(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/puzzles/themes`);
  if (!response.ok) {
    throw new Error('Failed to fetch themes');
  }
  return response.json();
}

async function submitAttempt(
  puzzleId: string,
  data: { success: boolean; movesTried: number; timeMs: number; mistakes: number }
): Promise<void> {
  await fetch(`${API_BASE}/api/puzzles/${puzzleId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export default function PuzzlesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Filters state - default to Medium difficulty
  const [filters, setFilters] = useState<PuzzleFilters>({
    minRating: 1400,
    maxRating: 2000,
    theme: '',
  });

  // Debounce filters so puzzle doesn't reload on every slider change
  // Only reloads after user stops adjusting for 800ms
  const debouncedFilters = useDebounce(filters, 800);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch themes
  const { data: availableThemes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: fetchThemes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch current puzzle - uses debounced filters so it doesn't reload on every change
  const {
    data: puzzle,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['puzzle', debouncedFilters],
    queryFn: () => fetchRandomPuzzle(debouncedFilters),
    staleTime: 0, // Always fetch fresh
    retry: 3, // Retry up to 3 times for network issues
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid interruptions
  });

  // Prefetch next puzzle - runs automatically when current puzzle loads
  // This makes "Next Puzzle" instant on subsequent clicks
  useEffect(() => {
    if (puzzle && !isLoading) {
      // Prefetch immediately - use requestIdleCallback if available, otherwise setTimeout
      // This runs when the browser is idle, not blocking the UI
      const prefetchNext = () => {
        queryClient.prefetchQuery({
          queryKey: ['puzzle', debouncedFilters, 'next'],
          queryFn: () => fetchRandomPuzzle(debouncedFilters),
          staleTime: 5 * 60 * 1000, // Keep prefetched puzzle fresh for 5 minutes
        }).catch(() => {
          // Silently fail - prefetch is optional
        });
      };

      let timeoutId: NodeJS.Timeout | number;
      let idleCallbackId: number | undefined;

      if (typeof requestIdleCallback !== 'undefined') {
        idleCallbackId = requestIdleCallback(prefetchNext, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        timeoutId = setTimeout(prefetchNext, 0);
      }
      
      return () => {
        if (idleCallbackId !== undefined && typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(idleCallbackId);
        } else if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
      };
    }
    return undefined;
  }, [puzzle?.id, debouncedFilters, queryClient, isLoading]); // Use puzzle.id to avoid re-prefetching on same puzzle

  // Use puzzle hook for game logic
  const puzzleState = usePuzzle(puzzle);

  // Clear brainstorming highlights and arrows when puzzle changes or resets
  useEffect(() => {
    setBrainstormSquares([]);
    setBrainstormArrows([]);
  }, [puzzle?.id]);

  // Timer effect
  useEffect(() => {
    if (!puzzle || puzzleState.isComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [puzzle, puzzleState.isComplete]);

  // Reset timer when puzzle changes
  useEffect(() => {
    setElapsedSeconds(0);
  }, [puzzle?.id]);

  // Submit attempt when puzzle is completed
  useEffect(() => {
    if (puzzleState.isComplete && puzzle) {
      const timeMs = puzzleState.elapsedTime;
      submitAttempt(puzzle.id, {
        success: puzzleState.isSolved,
        movesTried: puzzleState.movesTried,
        timeMs,
        mistakes: puzzleState.mistakes,
      }).catch((err) => console.error('Failed to submit attempt:', err));
    }
  }, [puzzleState.isComplete, puzzleState.isSolved, puzzleState.elapsedTime, puzzleState.movesTried, puzzleState.mistakes, puzzle]);

  // Memoize FEN string to prevent board remounts
  const gameFen = useMemo(() => {
    return puzzleState.game.fen();
  }, [puzzleState.game]);

  // Track pending moves to prevent double-clicks and race conditions
  const pendingMoveRef = useRef<{ from: Square; to: Square } | null>(null);
  const isProcessingMoveRef = useRef(false);

  // Handle move drop with debouncing and optimistic updates
  const handlePieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, _piece: string) => {
    // Prevent double-clicks and rapid moves
    if (isProcessingMoveRef.current) {
      return false;
    }

    // Check if this is a duplicate of a pending move
    if (pendingMoveRef.current && 
        pendingMoveRef.current.from === sourceSquare && 
        pendingMoveRef.current.to === targetSquare) {
      return false;
    }

    // Set pending move immediately for optimistic UI
    pendingMoveRef.current = { from: sourceSquare, to: targetSquare };
    isProcessingMoveRef.current = true;

    // Validate move synchronously using refs (fast, no async delays)
    const isValid = puzzleState.validateMove(sourceSquare, targetSquare, undefined);

    // Clear pending move after validation
    // Use setTimeout to allow state updates to complete
    setTimeout(() => {
      pendingMoveRef.current = null;
      isProcessingMoveRef.current = false;
    }, 0);

    return isValid;
  }, [puzzleState]);

  // Handle next puzzle - use prefetched puzzle if available, otherwise refetch immediately
  const handleNext = useCallback(() => {
    // Try to get the prefetched puzzle first (synchronous)
    const prefetchedPuzzle = queryClient.getQueryData<Puzzle>(['puzzle', debouncedFilters, 'next']);
    
    if (prefetchedPuzzle) {
      // Use prefetched puzzle immediately - no API call needed, instant response!
      // Set the data directly - React Query will notify all subscribers automatically
      queryClient.setQueryData(['puzzle', debouncedFilters], prefetchedPuzzle);
      
      // Remove the prefetched puzzle from cache since we're using it now
      queryClient.removeQueries({ queryKey: ['puzzle', debouncedFilters, 'next'] });
      
      // Immediately prefetch the next puzzle for future use (runs in background, non-blocking)
      // Use requestIdleCallback if available, otherwise setTimeout
      const prefetchNext = () => {
        queryClient.prefetchQuery({
          queryKey: ['puzzle', debouncedFilters, 'next'],
          queryFn: () => fetchRandomPuzzle(debouncedFilters),
          staleTime: 5 * 60 * 1000,
        }).catch(() => {
          // Silently fail - prefetch is optional
        });
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(prefetchNext, { timeout: 2000 });
      } else {
        setTimeout(prefetchNext, 0);
      }
    } else {
      // No prefetched puzzle available - refetch immediately
      // Don't await - let it run and update when ready
      refetch({ cancelRefetch: false });
      
      // Prefetch the next puzzle in background (don't wait for it)
      const prefetchNext = () => {
        queryClient.prefetchQuery({
          queryKey: ['puzzle', debouncedFilters, 'next'],
          queryFn: () => fetchRandomPuzzle(debouncedFilters),
          staleTime: 5 * 60 * 1000,
        }).catch(() => {
          // Silently fail - prefetch is optional
        });
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(prefetchNext, { timeout: 2000 });
      } else {
        setTimeout(prefetchNext, 0);
      }
    }
  }, [queryClient, debouncedFilters, refetch]);

  // Handle filters change
  const handleFiltersChange = (newFilters: PuzzleFilters) => {
    setFilters(newFilters);
  };

  // Brainstorming highlights - squares clicked by user for brainstorming
  const [brainstormSquares, setBrainstormSquares] = useState<Square[]>([]);
  // Brainstorming arrows - arrows drawn by user for brainstorming
  const [brainstormArrows, setBrainstormArrows] = useState<Array<[Square, Square]>>([]);

  // Handle square click for brainstorming
  const handleSquareClick = useCallback((square: Square) => {
    setBrainstormSquares((prev) => {
      if (prev.includes(square)) {
        // Remove if already highlighted
        return prev.filter((s) => s !== square);
      } else {
        // Add to highlights
        return [...prev, square];
      }
    });
  }, []);

  // Handle square right-click to clear everything (single click)
  const handleSquareRightClick = useCallback((_square: Square) => {
    // Single right-click - clear all brainstorming highlights and arrows
    setBrainstormSquares([]);
    setBrainstormArrows([]);
    // Clear hint arrows by clearing hint state
    puzzleState.clearHints();
  }, [puzzleState]);

  // Combine hint squares and brainstorming squares
  const highlightedSquares = useMemo(() => {
    const squares: Square[] = [];
    
    // Add hint squares
    if (puzzleState.hintType === 'move' && puzzleState.hintMove) {
      // For move hints, highlight both origin and destination
      squares.push(puzzleState.hintMove.from);
      squares.push(puzzleState.hintMove.to);
      console.log('Highlighted squares (move):', squares);
    } else if (puzzleState.hintType === 'piece' && puzzleState.hintSquare) {
      // For piece hints, just highlight the piece square
      squares.push(puzzleState.hintSquare);
      console.log('Highlighted squares (piece):', squares);
    }
    
    // Add brainstorming squares (avoid duplicates)
    brainstormSquares.forEach((square) => {
      if (!squares.includes(square)) {
        squares.push(square);
      }
    });
    
    return squares;
  }, [puzzleState.hintSquare, puzzleState.hintType, puzzleState.hintMove, brainstormSquares]);

  // Determine board orientation based on mating side
  // Board should always be from the perspective of the pieces that are mating
  const boardOrientation = useMemo<'white' | 'black'>(() => {
    if (!puzzleState.matingSide) return 'white';
    return puzzleState.matingSide === 'black' ? 'black' : 'white';
  }, [puzzleState.matingSide]);

  // Show error state
  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('puzzles.title', 'Puzzle Mode')}
        </Typography>
        <Card sx={{ p: 3, mt: 2, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error.dark" gutterBottom>
            Error loading puzzle
          </Typography>
          <Typography variant="body2" color="error.dark">
            {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Make sure:
            <br />
            1. Backend is running on port 4001
            <br />
            2. MongoDB has puzzles in the 'chess' database
            <br />
            3. Check browser console for more details
          </Typography>
        </Card>
      </Container>
    );
  }

  // Show loading state
  if (!puzzle) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('puzzles.title', 'Puzzle Mode')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isLoading ? t('puzzles.loading', 'Loading puzzle...') : t('puzzles.noPuzzle', 'No puzzle found')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Board Area */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box 
              sx={{ 
                width: '100%',
                maxWidth: { xs: '100%', sm: 500, md: 600 },
                touchAction: 'none', // Prevent default touch behaviors for better drag support
              }}
            >
              <Box key={puzzle?.id || 'puzzle-board'}>
                {/* @ts-ignore - ThemedBoard extends ChessboardProps which includes these props */}
                <ThemedBoard
                  position={gameFen} // Memoized FEN string
                  onPieceDrop={handlePieceDrop} // Memoized callback
                  boardOrientation={boardOrientation} // Memoized
                  highlightedSquares={highlightedSquares} // Memoized
                  hintType={puzzleState.hintType}
                  hintMove={puzzleState.hintMove}
                  brainstormArrows={brainstormArrows}
                  animationDuration={200}
                  arePiecesDraggable={!puzzleState.isComplete}
                  onSquareClick={handleSquareClick} // Already memoized
                  onSquareRightClick={handleSquareRightClick} // Already memoized
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <PuzzleSidebar
            puzzleId={puzzle.id}
            rating={puzzle.rating}
            themes={puzzle.themes}
            availableThemes={availableThemes}
            filters={filters}
            mistakes={puzzleState.mistakes}
            elapsedSeconds={elapsedSeconds}
            isComplete={puzzleState.isComplete}
            isSolved={puzzleState.isSolved}
            isLoading={isLoading}
            mateInX={puzzleState.mateInX}
            currentTurn={puzzleState.currentTurn as 'white' | 'black' | null}
            onHint={puzzleState.showHint}
            onReset={puzzleState.resetPuzzle}
            onNext={handleNext}
            onSolution={puzzleState.playSolution}
            onFiltersChange={handleFiltersChange}
          />
        </Grid>
      </Grid>

      {/* Settings Button */}
      <EngineSettingsButton />
    </Container>
  );
}

