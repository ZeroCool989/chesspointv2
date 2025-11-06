import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Slider,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Lightbulb,
  Refresh,
  NavigateNext,
  Timer,
  EmojiEvents,
  PlayArrow,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export interface PuzzleFilters {
  minRating: number;
  maxRating: number;
  theme: string;
}

export interface PuzzleSidebarProps {
  puzzleId: string;
  rating: number;
  themes: string[];
  availableThemes: string[];
  filters: PuzzleFilters;
  mistakes: number;
  elapsedSeconds: number;
  isComplete: boolean;
  isSolved: boolean;
  isLoading: boolean;
  mateInX: number | null;
  currentTurn: 'white' | 'black' | null;
  onHint: (type?: 'move' | 'piece') => void;
  onReset: () => void;
  onNext: () => void;
  onSolution: () => void;
  onFiltersChange: (filters: PuzzleFilters) => void;
}

export function PuzzleSidebar({
  puzzleId,
  rating,
  themes,
  availableThemes,
  filters,
  mistakes,
  elapsedSeconds,
  isComplete,
  isSolved,
  isLoading,
  mateInX,
  currentTurn,
  onHint,
  onReset,
  onNext,
  onSolution,
  onFiltersChange,
}: PuzzleSidebarProps) {
  const { t } = useTranslation();
  const [hintDialogOpen, setHintDialogOpen] = useState(false);

  const handleRatingChange = (_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFiltersChange({ ...filters, minRating: min, maxRating: max });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Puzzle Info */}
        <Box>
          <Typography variant="overline" color="text.secondary">
            {t('puzzles.puzzleTheme', 'Puzzle Theme')}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
            {themes.length > 0 ? (
              themes.map((theme) => (
                <Chip
                  key={theme}
                  label={theme}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('puzzles.noTheme', 'No theme')}
              </Typography>
            )}
          </Stack>
          
          {/* Mate in X - directly under themes */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="overline" color="text.secondary">
              {t('puzzles.mateIn', 'Mate in')}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {mateInX ? (
                <>
                  {mateInX} {mateInX === 1 ? t('puzzles.move', 'move') : t('puzzles.moves', 'moves')}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('puzzles.calculating', 'Calculating...')}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Turn indicator and Rating */}
        <Box>
          {currentTurn && !isComplete && (
            <Box mb={1.5}>
              <Typography variant="overline" color="text.secondary">
                {t('puzzles.turn', 'Turn')}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {currentTurn === 'white' ? t('puzzles.whiteToMove', 'White to move') : t('puzzles.blackToMove', 'Black to move')}
              </Typography>
            </Box>
          )}
          
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>
              {t('puzzles.rating', 'Rating')}: {rating}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/* Stats */}
        <Box>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('puzzles.mistakes', 'Mistakes')}
              </Typography>
              <Typography variant="h6" color={mistakes > 0 ? 'error.main' : 'text.primary'}>
                {mistakes}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('puzzles.time', 'Time')}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Timer fontSize="small" />
                <Typography variant="h6">{formatTime(elapsedSeconds)}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Success Message */}
        {isComplete && isSolved && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'success.main',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t('puzzles.solved', 'Puzzle Solved!')}
            </Typography>
            <Typography variant="body2">
              {t('puzzles.solvedDetails', 'Great job! You completed the puzzle.')}
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Lightbulb />}
            onClick={() => setHintDialogOpen(true)}
            disabled={isComplete || isLoading}
            fullWidth
          >
            {t('puzzles.hint', 'Hint')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={onSolution}
            disabled={isComplete || isLoading}
            fullWidth
          >
            {t('puzzles.solution', 'Solution')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onReset}
            disabled={isLoading}
            fullWidth
          >
            {t('puzzles.tryAgain', 'Try Again')}
          </Button>

          <Button
            variant="contained"
            startIcon={<NavigateNext />}
            onClick={onNext}
            disabled={isLoading}
            fullWidth
          >
            {t('puzzles.next', 'Next Puzzle')}
          </Button>
        </Stack>

        {/* Hint Dialog */}
        <Dialog open={hintDialogOpen} onClose={() => setHintDialogOpen(false)}>
          <DialogTitle>{t('puzzles.hint', 'Hint')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  onHint('move');
                  setHintDialogOpen(false);
                }}
                fullWidth
              >
                {t('puzzles.showMove', 'Show Move')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  onHint('piece');
                  setHintDialogOpen(false);
                }}
                fullWidth
              >
                {t('puzzles.showPiece', 'Show Piece')}
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHintDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </DialogActions>
        </Dialog>

        <Divider />

        {/* Filters */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            {t('puzzles.filters', 'Filters')}
          </Typography>

          <Stack spacing={2}>
            {/* Rating Range Slider */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('puzzles.ratingRange', 'Rating Range')}: {filters.minRating} - {filters.maxRating}
              </Typography>
              <Box sx={{ px: 4, width: '100%' }}>
                <Slider
                  value={[filters.minRating, filters.maxRating]}
                  onChange={handleRatingChange}
                  valueLabelDisplay="auto"
                  min={600}
                  max={3200}
                  step={50}
                  disabled={isLoading}
                  marks={[
                    { value: 600, label: '🟢 Easy' },
                    { value: 1400, label: '🟡 Medium' },
                    { value: 2000, label: '🟠 Hard' },
                    { value: 2600, label: '🔴 Expert' },
                    { value: 3200, label: '🔥 Extreme' },
                  ]}
                />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1.2, fontSize: '0.7rem', px: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                  Easy: 600-1400
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                  Medium: 1400-2000
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                  Hard: 2000-2600
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                  Expert: 2600-3200+
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                  Extreme: 3200+
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PuzzleSidebar;
