import { Stack, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { gameAtom } from "../../states";
import { usePlayersData } from "@/hooks/usePlayersData";

interface Props {
  title: string;
  whiteValue: string | number;
  blackValue: string | number;
}

export default function PlayersMetric({
  title,
  whiteValue,
  blackValue,
}: Props) {
  const { white, black } = usePlayersData(gameAtom);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={1}
    >
      {/* Player names at top */}
      <Stack
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        gap={2}
      >
        <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.8rem">
          {white.name}
          {white.rating && (
            <Typography
              component="span"
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            >
              ({white.rating})
            </Typography>
          )}
        </Typography>

        <Typography
          variant="body2"
          fontWeight="600"
          color="rgba(123, 90, 240, 0.7)"
          fontSize="0.8rem"
        >
          vs
        </Typography>

        <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.8rem">
          {black.name}
          {black.rating && (
            <Typography
              component="span"
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            >
              ({black.rating})
            </Typography>
          )}
        </Typography>
      </Stack>

      {/* Values below */}
      <Stack
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        columnGap={{ xs: "8vw", md: 10 }}
      >
        <ValueBlock value={whiteValue} color="white" />

        <Typography align="center" fontSize="0.8em" noWrap>
          {title}
        </Typography>

        <ValueBlock value={blackValue} color="black" />
      </Stack>
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
