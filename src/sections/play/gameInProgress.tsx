import {
  Button,
  CircularProgress,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { gameAtom, isGameInProgressAtom } from "./states";
import { useEffect } from "react";
import UndoMoveButton from "./undoMoveButton";

export default function GameInProgress() {
  const game = useAtomValue(gameAtom);
  const [isGameInProgress, setIsGameInProgress] = useAtom(isGameInProgressAtom);

  useEffect(() => {
    if (game.isGameOver()) setIsGameInProgress(false);
  }, [game, setIsGameInProgress]);

  const handleResign = () => {
    setIsGameInProgress(false);
  };

  if (!isGameInProgress) return null;

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      gap={2}
      size={12}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        gap={2}
        size={12}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            textAlign: 'center'
          }}
        >
          Game in progress
        </Typography>
        <CircularProgress size={20} color="info" />
      </Grid>

      <Grid container justifyContent="center" alignItems="center" size={12}>
        <UndoMoveButton />
      </Grid>

      <Grid container justifyContent="center" alignItems="center" size={12}>
        <Button 
          variant="contained" 
          onClick={handleResign}
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            padding: '12px 24px',
            borderRadius: '8px',
            textTransform: 'none',
            backgroundColor: '#7B5AF0',
            color: 'white',
            boxShadow: '0 2px 8px rgba(123, 90, 240, 0.3)',
            '&:hover': {
              backgroundColor: '#6D4CDB',
              boxShadow: '0 4px 12px rgba(123, 90, 240, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Resign
        </Button>
      </Grid>
    </Grid>
  );
}
