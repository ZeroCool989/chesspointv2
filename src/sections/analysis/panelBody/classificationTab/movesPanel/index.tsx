import { Grid2 as Grid } from "@mui/material";
import MovesLine from "./movesLine";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom, gameEvalAtom } from "../../../states";
import { MoveClassification } from "@/types/enums";

export default function MovesPanel() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const gameEval = useAtomValue(gameEvalAtom);

  const gameMoves = useMemo(() => {
    const gameHistory = game.history();
    const boardHistory = board.history();
    const history = gameHistory.length ? gameHistory : boardHistory;

    if (!history.length) return undefined;

    const moves: { san: string; moveClassification?: MoveClassification }[][] =
      [];

    for (let i = 0; i < history.length; i += 2) {
      const items = [
        {
          san: history[i],
          moveClassification: gameHistory.length
            ? gameEval?.positions[i + 1]?.moveClassification
            : undefined,
        },
      ];

      if (history[i + 1]) {
        items.push({
          san: history[i + 1],
          moveClassification: gameHistory.length
            ? gameEval?.positions[i + 2]?.moveClassification
            : undefined,
        });
      }

      moves.push(items);
    }

    return moves;
  }, [game, board, gameEval]);

  if (!gameMoves?.length) return null;

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="start"
      gap={0.5}
      paddingY={1}
      className="chesspoint-move-log"
      sx={{ 
        scrollbarWidth: "thin", 
        overflowY: "auto",
        maxHeight: "calc(100vh - 400px)",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(123, 90, 240, 0.1)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(123, 90, 240, 0.3)",
          borderRadius: "4px",
          "&:hover": {
            background: "rgba(123, 90, 240, 0.5)",
          },
        },
      }}
      size={6}
      id="moves-panel"
    >
      {gameMoves?.map((moves, idx) => (
        <MovesLine
          key={`${moves.map(({ san }) => san).join()}-${idx}`}
          moves={moves}
          moveNb={idx + 1}
        />
      ))}
    </Grid>
  );
}
