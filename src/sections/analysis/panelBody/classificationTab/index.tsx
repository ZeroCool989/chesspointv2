import { Grid2 as Grid, Grid2Props as GridProps, Box, Typography } from "@mui/material";
import MovesPanel from "./movesPanel";
import MovesClassificationsRecap from "./movesClassificationsRecap";
import { useAtomValue } from "jotai";
import { gameAtom, gameEvalAtom } from "../../states";
import { usePlayersData } from "@/hooks/usePlayersData";

export default function ClassificationTab(props: GridProps) {
  const { white, black } = usePlayersData(gameAtom);
  const gameEval = useAtomValue(gameEvalAtom);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="start"
      size={12}
      flexGrow={1}
      {...props}
      sx={
        props.hidden ? { display: "none" } : { overflow: "hidden", ...props.sx }
      }
    >
      {/* Player stats header */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid rgba(123, 90, 240, 0.2)',
          gap: 1.5
        }}
      >
        {/* Player names */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.9rem'
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
                  fontSize: '0.75rem'
                }}
              >
                ({white.rating})
              </Typography>
            )}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'rgba(123, 90, 240, 0.7)',
              fontSize: '0.8rem'
            }}
          >
            vs
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.9rem'
            }}
          >
            {black.name}
            {black.rating && (
              <Typography
                component="span"
                sx={{
                  ml: 0.5,
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                ({black.rating})
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Metrics row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          {/* White metrics */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.75rem',
                mb: 0.25
              }}
            >
              Accuracy: {gameEval ? `${gameEval.accuracy.white.toFixed(1)}%` : '—'}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Est. ELO: {gameEval?.estimatedElo ? Math.round(gameEval.estimatedElo.white) : '—'}
            </Typography>
          </Box>

          {/* Black metrics */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.75rem',
                mb: 0.25
              }}
            >
              Accuracy: {gameEval ? `${gameEval.accuracy.black.toFixed(1)}%` : '—'}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Est. ELO: {gameEval?.estimatedElo ? Math.round(gameEval.estimatedElo.black) : '—'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MovesPanel />

      <MovesClassificationsRecap />
    </Grid>
  );
}
