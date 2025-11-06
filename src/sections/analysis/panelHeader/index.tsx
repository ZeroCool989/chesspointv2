import { Box, Typography } from "@mui/material";
import GamePanel from "./gamePanel";
import LoadGame from "./loadGame";
import AnalyzeButton from "./analyzeButton";
import LinearProgressBar from "@/components/LinearProgressBar";
import { useAtomValue } from "jotai";
import { evaluationProgressAtom, gameAtom } from "../states";
import { usePlayersData } from "@/hooks/usePlayersData";

export default function PanelHeader() {
  const evaluationProgress = useAtomValue(evaluationProgressAtom);
  const { white, black } = usePlayersData(gameAtom);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Game metadata - centered */}
      <GamePanel />

      {/* Player names - centered, above controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}
        >
          {white.name}
          {white.rating && (
            <Typography
              component="span"
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.8rem'
              }}
            >
              ({white.rating})
            </Typography>
          )}
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              color: 'rgba(123, 90, 240, 0.7)',
              px: 2,
              fontSize: '0.8rem'
            }}
          >
            vs
          </Typography>
          {black.name}
          {black.rating && (
            <Typography
              component="span"
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.8rem'
              }}
            >
              ({black.rating})
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Game controls - centered */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          mt: 2,
        }}
      >
        <LoadGame />
        <AnalyzeButton />
      </Box>

      {/* Progress bar */}
      {evaluationProgress > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgressBar value={evaluationProgress} label="Analyzing..." />
        </Box>
      )}
    </Box>
  );
}
