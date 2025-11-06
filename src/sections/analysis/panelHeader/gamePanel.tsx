import { Box, Typography } from "@mui/material";
import { useGameDatabase } from "@/hooks/useGameDatabase";
import { useAtomValue } from "jotai";
import { gameAtom } from "../states";

// Convert date from yyyy.mm.dd or yyyy-mm-dd to dd.mm.yyyy
const formatToEuropeanDate = (dateStr: string): string => {
  if (!dateStr || dateStr === "?" || dateStr === "Unknown Date") return dateStr;

  // Handle yyyy.mm.dd or yyyy-mm-dd format
  const parts = dateStr.replace(/\./g, '-').split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  }

  return dateStr;
};

// Convert time from 12-hour to 24-hour format if needed
const formatTo24Hour = (timeStr: string): string => {
  if (!timeStr || timeStr === "?") return timeStr;

  // If already in 24-hour format or no time, return as is
  if (!timeStr.match(/AM|PM|am|pm/i)) return timeStr;

  const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM|am|pm)/i);
  if (!match) return timeStr;

  let [, hours, minutes, seconds, period] = match;
  let hour = parseInt(hours, 10);

  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const hourStr = hour.toString().padStart(2, '0');
  const secStr = seconds ? `:${seconds}` : '';
  return `${hourStr}:${minutes}${secStr}`;
};

export default function GamePanel() {
  const { gameFromUrl } = useGameDatabase();
  const game = useAtomValue(gameAtom);
  const gameHeaders = game.getHeaders();

  const hasGameInfo =
    gameFromUrl !== undefined ||
    (!!gameHeaders.White && gameHeaders.White !== "?");

  if (!hasGameInfo) return null;

  const result = gameFromUrl?.result || gameHeaders.Result || "1/2-1/2";

  const site = gameFromUrl?.site || gameHeaders.Site || "Unknown Site";
  const rawDate = gameFromUrl?.date || gameHeaders.Date || "Unknown Date";
  const date = formatToEuropeanDate(rawDate);
  const rawTime = gameHeaders.Time || gameHeaders.UTCTime;
  const time = rawTime ? formatTo24Hour(rawTime) : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1.5 },
        padding: '12px 16px',
        borderRadius: 2,
        backgroundColor: 'rgba(123, 90, 240, 0.05)',
        border: '1px solid rgba(123, 90, 240, 0.1)',
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
      }}
    >
      {/* Location */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          📍
        </Box>
        <Typography
          fontSize="0.85rem"
          fontWeight={500}
          sx={{
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          {site}
        </Typography>
      </Box>

      <Typography
        fontSize="0.85rem"
        sx={{
          color: 'rgba(123, 90, 240, 0.6)',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        •
      </Typography>

      {/* Date */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          📅
        </Box>
        <Typography
          fontSize="0.85rem"
          fontWeight={500}
          sx={{
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          {date}
        </Typography>
      </Box>

      {time && (
        <>
          <Typography
            fontSize="0.85rem"
            sx={{
              color: 'rgba(123, 90, 240, 0.6)',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            •
          </Typography>

          {/* Time */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              🕐
            </Box>
            <Typography
              fontSize="0.85rem"
              fontWeight={500}
              sx={{
                color: 'text.primary',
                textAlign: 'center',
              }}
            >
              {time}
            </Typography>
          </Box>
        </>
      )}

      <Typography
        fontSize="0.85rem"
        sx={{
          color: 'rgba(123, 90, 240, 0.6)',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        •
      </Typography>

      {/* Result */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          🏆
        </Box>
        <Typography
          fontSize="0.85rem"
          fontWeight={600}
          sx={{
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          {result}
        </Typography>
      </Box>
    </Box>
  );
}
