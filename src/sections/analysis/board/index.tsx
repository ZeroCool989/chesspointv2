"use client";
import { useAtomValue } from "jotai";
import {
  boardAtom,
  boardOrientationAtom,
  currentPositionAtom,
  gameAtom,
  showBestMoveArrowAtom,
  showPlayerMoveIconAtom,
} from "../states";
import { useMemo, useState, useEffect } from "react";
import { Color } from "@/types/enums";
import Board from "@/components/board";
import { usePlayersData } from "@/hooks/usePlayersData";

// Export the board size calculation for use in other components
export const useBoardSize = () => {
  const [boardSize, setBoardSize] = useState(400); // Start with default size

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Calculate initial size after mount
    const calculateInitialSize = () => {
      setBoardSize(calculateBoardSize());
    };

    // Set initial size immediately
    calculateInitialSize();

    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return boardSize;
};

const calculateBoardSize = () => {
  if (typeof window === "undefined") {
    return 400;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 900 is the md layout breakpoint
  if (width < 900) {
    return Math.min(width, height - 150);
  }

  // Board now takes 50% of width, so calculate based on that
  // Account for padding and gap (2 * 16px gap + 2 * 32px padding = ~96px)
  const availableWidth = (width * 0.5) - 96;
  const availableHeight = height * 0.83;
  return Math.min(availableWidth, availableHeight);
};

export default function BoardContainer() {
  const boardOrientation = useAtomValue(boardOrientationAtom);
  const showBestMoveArrow = useAtomValue(showBestMoveArrowAtom);
  const { white, black } = usePlayersData(gameAtom);
  const boardSize = useBoardSize();

  return (
    <Board
      id="AnalysisBoard"
      boardSize={boardSize}
      canPlay={true}
      gameAtom={boardAtom}
      whitePlayer={white}
      blackPlayer={black}
      boardOrientation={boardOrientation ? Color.White : Color.Black}
      currentPositionAtom={currentPositionAtom}
      showBestMoveArrow={showBestMoveArrow}
      showPlayerMoveIconAtom={showPlayerMoveIconAtom}
      showEvaluationBar={true}
    />
  );
}
