import { useGameDatabase } from "@/hooks/useGameDatabase";
import { Icon } from "@iconify/react";
import { Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { boardAtom, gameAtom, gameEvalAtom } from "../states";
import { getGameToSave } from "@/lib/chess";
import { useAuth } from "@/contexts/AuthContext";

export default function SaveButton() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const gameEval = useAtomValue(gameEvalAtom);
  const { addGame, setGameEval, gameFromUrl } = useGameDatabase();
  const router = useRouter();
  const { user } = useAuth();

  const enableSave =
    !gameFromUrl && (board.history().length || game.history().length);

  const handleSave = async () => {
    if (!enableSave) return;

    const gameToSave = getGameToSave(game, board);

    try {
      console.log("🔄 Starting to save game...");
      console.log("👤 User logged in:", !!user);
      
      const gameId = await addGame(gameToSave);
      console.log("✅ Game saved successfully with ID:", gameId);
      
      if (gameEval) {
        await setGameEval(gameId, gameEval);
      }

      router.replace(
        {
          query: { gameId: gameId },
          pathname: router.pathname,
        },
        undefined,
        { shallow: true, scroll: false }
      );
    } catch (error) {
      console.error("❌ Error saving game:", error);
      alert(`Failed to save game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      {gameFromUrl ? (
        <Tooltip title="Game saved in database">
          <Grid>
            <IconButton disabled={true} sx={{ paddingX: 1.2, paddingY: 0.5 }}>
              <Icon icon="ri:folder-check-line" />
            </IconButton>
          </Grid>
        </Tooltip>
      ) : (
        <Tooltip 
          title={
            user 
              ? "Save game to MongoDB (gamesDB) - Logged in" 
              : "Save game to Browser (IndexedDB) - Not logged in"
          }
        >
          <Grid>
            <IconButton
              onClick={handleSave}
              disabled={!enableSave}
              sx={{ paddingX: 1.2, paddingY: 0.5 }}
            >
              <Icon icon="ri:save-3-line" />
            </IconButton>
          </Grid>
        </Tooltip>
      )}
    </>
  );
}
