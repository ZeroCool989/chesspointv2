import { Stack, Typography, Box } from "@mui/material";
import { gameAtom } from "../../states";
import { usePlayersData } from "@/hooks/usePlayersData";

interface Props {
  accuracyWhite: number;
  accuracyBlack: number;
  ratingWhite?: number;
  ratingBlack?: number;
}

export default function PlayersMetricsCombined({
  accuracyWhite,
  accuracyBlack,
  ratingWhite,
  ratingBlack,
}: Props) {
  const { white, black } = usePlayersData(gameAtom);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={2.5}
    >
      {/* Player names at top - shown only once */}
      <Stack
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        sx={{ width: '100%', maxWidth: '500px' }}
      >
        <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.8rem" sx={{ flex: 1, textAlign: 'left', px: 1 }}>
          {white.name}
        </Typography>

        <Typography
          variant="body2"
          fontWeight="600"
          color="rgba(123, 90, 240, 0.7)"
          fontSize="0.8rem"
          sx={{ px: 2 }}
        >
          vs
        </Typography>

        <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.8rem" sx={{ flex: 1, textAlign: 'right', px: 1 }}>
          {black.name}
        </Typography>
      </Stack>

      {/* Accuracy row */}
      <Stack
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        sx={{ width: '100%', maxWidth: '500px' }}
      >
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', px: 1 }}>
          <ValueBlock value={`${accuracyWhite.toFixed(1)} %`} color="white" />
        </Box>

        <Typography align="center" fontSize="0.8em" noWrap sx={{ px: 2 }}>
          Accuracy
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', px: 1 }}>
          <ValueBlock value={`${accuracyBlack.toFixed(1)} %`} color="black" />
        </Box>
      </Stack>

      {/* Game Rating row - only if ratings exist */}
      {ratingWhite && ratingBlack && (
        <Stack
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          sx={{ width: '100%', maxWidth: '500px' }}
        >
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', px: 1 }}>
            <ValueBlock value={Math.round(ratingWhite)} color="white" />
          </Box>

          <Typography align="center" fontSize="0.8em" noWrap sx={{ px: 2 }}>
            Game Rating
          </Typography>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', px: 1 }}>
            <ValueBlock value={Math.round(ratingBlack)} color="black" />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

const ValueBlock = ({
  value,
  color,
}: {
  value: string | number;
  color: "white" | "black";
}) => {
  return (
    <Typography
      align="center"
      sx={{
        backgroundColor: color,
        color: color === "white" ? "black" : "white",
      }}
      borderRadius="5px"
      lineHeight="1em"
      fontSize="0.9em"
      padding={0.8}
      fontWeight="500"
      border="1px solid #424242"
      noWrap
    >
      {value}
    </Typography>
  );
};
