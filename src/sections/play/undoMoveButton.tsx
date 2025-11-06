import { Button } from "@mui/material";
import { gameAtom, playerColorAtom } from "./states";
import { useAtomValue } from "jotai";
import { useChessActions } from "@/hooks/useChessActions";
import { Color } from "@/types/enums";

export default function UndoMoveButton() {
  const game = useAtomValue(gameAtom);
  const { goToMove, undoMove } = useChessActions(gameAtom);
  const playerColor = useAtomValue(playerColorAtom);

  const handleClick = () => {
    const gameHistory = game.history();
    const turnColor = game.turn();
    if (
      (turnColor === "w" && playerColor === Color.White) ||
      (turnColor === "b" && playerColor === Color.Black)
    ) {
      if (gameHistory.length < 2) return;
      goToMove(gameHistory.length - 2, game);
    } else {
      if (!gameHistory.length) return;
      undoMove();
    }
  };

  return (
    <Button 
      variant="contained" 
      onClick={handleClick}
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
      Undo your last move
    </Button>
  );
}
