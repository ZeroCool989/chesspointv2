"use client";
import { Grid2 as Grid, IconButton, Tooltip, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import FlipBoardButton from "./flipBoardButton";
import NextMoveButton from "./nextMoveButton";
import GoToLastPositionButton from "./goToLastPositionButton";
import SaveButton from "./saveButton";
import { useEffect } from "react";

export default function PanelToolBar() {
  const board = useAtomValue(boardAtom);
  const { resetToStartingPosition: resetBoard, undoMove: undoBoardMove } =
    useChessActions(boardAtom);

  const boardHistory = board.history();
  const game = useAtomValue(gameAtom);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (boardHistory.length === 0) return;
      if (e.key === "ArrowLeft") {
        undoBoardMove();
      } else if (e.key === "ArrowDown") {
        resetBoard();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undoBoardMove, boardHistory, resetBoard, board]);

  return (
    <Grid container justifyContent="center" alignItems="center" size={12}>
      <FlipBoardButton />

      <Tooltip title="Reset board">
        <span>
          <Button
            variant="outlined"
            onClick={() => resetBoard()}
            disabled={boardHistory.length === 0}
            startIcon={<Icon icon="ri:skip-back-line" />}
            className="chesspoint-button"
          >
            Reset
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="Go to previous move">
        <span>
          <Button
            variant="outlined"
            onClick={() => undoBoardMove()}
            disabled={boardHistory.length === 0}
            startIcon={<Icon icon="ri:arrow-left-s-line" />}
            className="chesspoint-button"
          >
            Previous
          </Button>
        </span>
      </Tooltip>

      <NextMoveButton />

      <GoToLastPositionButton />

      <Tooltip title="Copy PGN">
        <span>
          <Button
            variant="outlined"
            disabled={game.history().length === 0}
            onClick={() => {
              navigator.clipboard?.writeText?.(game.pgn());
            }}
            startIcon={<Icon icon="ri:clipboard-line" />}
            className="chesspoint-button"
          >
            Copy PGN
          </Button>
        </span>
      </Tooltip>

      <SaveButton />
    </Grid>
  );
}
