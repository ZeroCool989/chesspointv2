import { PageTitle } from "@/components/pageTitle";
import Board from "@/sections/play/board";
import GameInProgress from "@/sections/play/gameInProgress";
import GameRecap from "@/sections/play/gameRecap";
import GameSettingsButton from "@/sections/play/gameSettings/gameSettingsButton";
import EngineSettingsButton from "@/sections/engineSettings/engineSettingsButton";
import { isGameInProgressAtom } from "@/sections/play/states";
import { Grid2 as Grid } from "@mui/material";
import { useAtomValue } from "jotai";

export default function Play() {
  const isGameInProgress = useAtomValue(isGameInProgressAtom);

  return (
    <Grid 
      container 
      gap={4} 
      justifyContent="center" 
      alignItems="start"
      sx={{
        minHeight: 'calc(100vh - 120px)',
        padding: { xs: 2, md: 4 },
        maxWidth: '1400px',
        margin: '0 auto'
      }}
    >
      <PageTitle title="Chesspoint Play vs Stockfish" />

      <Board />

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        borderRadius={2}
        border={1}
        borderColor={"secondary.main"}
        size={{
          xs: 12,
          md: "grow",
        }}
        sx={{
          backgroundColor: "secondary.main",
          borderColor: "primary.main",
          borderWidth: 2,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          alignSelf: 'center',
          minHeight: '200px',
          justifyContent: 'center'
        }}
        padding={2}
        rowGap={1.5}
        style={{
          maxWidth: "280px",
        }}
      >
        <GameInProgress />
        {!isGameInProgress && (
          <Grid container justifyContent="center" alignItems="center" size={12}>
            <GameSettingsButton />
          </Grid>
        )}
        <GameRecap />
      </Grid>

      <EngineSettingsButton />
    </Grid>
  );
}