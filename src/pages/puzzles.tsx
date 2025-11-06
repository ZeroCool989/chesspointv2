import { useState, useEffect, useMemo } from 'react';
import { Box, Container, Grid2 as Grid, Typography, Alert } from '@mui/material';
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

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch puzzle:', response.status, errorText);
    throw new Error(`Failed to fetch puzzle: ${response.status}`);
  }
  const data = await response.json();
  console.log('Puzzle data:', data);
  return data;
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
    retry: 1,
  });

  // Prefetch next puzzle
  useEffect(() => {
    if (puzzle) {
      queryClient.prefetchQuery({
        queryKey: ['puzzle', debouncedFilters, 'next'],
        queryFn: () => fetchRandomPuzzle(debouncedFilters),
      });
    }
  }, [puzzle, debouncedFilters, queryClient]);

  // Use puzzle hook for game logic
  const puzzleState = usePuzzle(puzzle);

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

  // Handle move drop
  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
    // piece format is like "wP" (white pawn), "bK" (black king), etc.
    // piece[0] is color (w/b), piece[1] is piece type (P, R, N, B, Q, K)
    // We don't get promotion from the piece string - it should be handled by the board
    // For now, pass undefined and let validateMove determine if promotion is needed
    return puzzleState.validateMove(sourceSquare, targetSquare, undefined);
  };

  // Handle next puzzle
  const handleNext = () => {
    refetch();
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: PuzzleFilters) => {
    setFilters(newFilters);
  };

  // Highlight hint square
  const highlightedSquares = useMemo(() => {
    return puzzleState.hintSquare ? [puzzleState.hintSquare] : [];
  }, [puzzleState.hintSquare]);

  // Determine board orientation based on mating side
  // Board should always be from the perspective of the pieces that are mating
  const boardOrientation = useMemo(() => {
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
              <ThemedBoard
                id="puzzle-board"
                position={puzzleState.game.fen()}
                onPieceDrop={handlePieceDrop}
                boardOrientation={boardOrientation}
                highlightedSquares={highlightedSquares}
                animationDuration={200}
                arePiecesDraggable={!puzzleState.isComplete}
              />
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
            currentTurn={puzzleState.currentTurn}
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
