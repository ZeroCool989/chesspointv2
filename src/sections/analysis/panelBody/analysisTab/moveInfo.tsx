import { Skeleton, Stack, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom, currentPositionAtom } from "../../states";
import { useMemo } from "react";
import { moveLineUciToSan } from "@/lib/chess";
import { MoveClassification } from "@/types/enums";
import Image from "next/image";
import PrettyMoveSan from "@/components/prettyMoveSan";
import { getMoveClassificationIcon } from "@/lib/helpers";

export default function MoveInfo() {
  const position = useAtomValue(currentPositionAtom);
  const board = useAtomValue(boardAtom);

  const bestMove = position?.lastEval?.bestMove;

  const bestMoveSan = useMemo(() => {
    if (!bestMove) return undefined;

    const lastPosition = board.history({ verbose: true }).at(-1)?.before;
    if (!lastPosition) return undefined;

    return moveLineUciToSan(lastPosition)(bestMove);
  }, [bestMove, board]);

  if (board.history().length === 0) return null;

  if (!bestMoveSan) {
    return (
      <Stack direction="row" alignItems="center" columnGap={5} marginTop={0.8}>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={"12em"}
          sx={{ color: "transparent", maxWidth: "7vw" }}
        >
          <Typography align="center" fontSize="0.9rem">
            placeholder
          </Typography>
        </Skeleton>
      </Stack>
    );
  }

  const moveClassification = position.eval?.moveClassification;

  const showBestMoveLabel =
    moveClassification !== MoveClassification.Best &&
    moveClassification !== MoveClassification.Opening &&
    moveClassification !== MoveClassification.Forced &&
    moveClassification !== MoveClassification.Splendid &&
    moveClassification !== MoveClassification.Perfect;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      columnGap={4}
      marginTop={0.5}
      flexWrap="wrap"
    >
      {moveClassification && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image
            src={`/icons/${getMoveClassificationIcon(moveClassification)}.png`}
            alt="move-icon"
            width={35}
            height={35}
            style={{
              maxWidth: "6vw",
              maxHeight: "6vw",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
            }}
          />

          <PrettyMoveSan
            typographyProps={{
              fontSize: "1rem",
              fontWeight: "500",
            }}
            san={position.lastMove?.san ?? ""}
            color={position.lastMove?.color ?? "w"}
            additionalText={
              " is " + moveClassificationLabels[moveClassification]
            }
          />
        </Stack>
      )}

      {showBestMoveLabel && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image
            src={"/icons/Optimal.png"}
            alt="move-icon"
            width={20}
            height={20}
            style={{
              maxWidth: "4vw",
              maxHeight: "4vw",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
            }}
          />
          <PrettyMoveSan
            typographyProps={{
              fontSize: "1rem",
              fontWeight: "500",
            }}
            san={bestMoveSan}
            color={position.lastMove?.color ?? "w"}
            additionalText=" was optimal"
          />
        </Stack>
      )}
    </Stack>
  );
}


const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.Opening]: "a book move",
  [MoveClassification.Forced]: "the only move",
  [MoveClassification.Splendid]: "a genius move !!",
  [MoveClassification.Perfect]: "a masterstroke !",
  [MoveClassification.Best]: "the optimal move",
  [MoveClassification.Excellent]: "a strong move",
  [MoveClassification.Okay]: "a solid move",
  [MoveClassification.Inaccuracy]: "a slight slip",
  [MoveClassification.Mistake]: "a tactical mistake",
  [MoveClassification.Blunder]: "a major blunder",
};
