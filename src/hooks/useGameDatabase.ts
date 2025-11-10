import { formatGameToDatabase } from "@/lib/chess";
import { GameEval } from "@/types/eval";
import { Game } from "@/types/game";
import { Chess } from "chess.js";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as gamesApi from "@/lib/gamesApi";

interface GameDatabaseSchema extends DBSchema {
  games: {
    value: Game;
    key: number;
  };
}

const gamesAtom = atom<Game[]>([]);
const fetchGamesAtom = atom<boolean>(false);

export const useGameDatabase = (shouldFetchGames?: boolean) => {
  const { user, accessToken } = useAuth();
  const [db, setDb] = useState<IDBPDatabase<GameDatabaseSchema> | null>(null);
  const [games, setGames] = useAtom(gamesAtom);
  const [fetchGames, setFetchGames] = useAtom(fetchGamesAtom);
  const [gameFromUrl, setGameFromUrl] = useState<Game | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Initialize IndexedDB only for non-logged-in users
  useEffect(() => {
    if (!user) {
      const initDatabase = async () => {
        const db = await openDB<GameDatabaseSchema>("games", 1, {
          upgrade(db) {
            db.createObjectStore("games", { keyPath: "id", autoIncrement: true });
          },
        });
        setDb(db);
      };
      initDatabase();
    }
  }, [user]);

  useEffect(() => {
    if (shouldFetchGames !== undefined) {
      setFetchGames(shouldFetchGames);
    }
  }, [shouldFetchGames, setFetchGames]);

  // Load games - MongoDB for logged-in users, IndexedDB for guests
  const loadGames = useCallback(async () => {
    if (!fetchGames) return;

    setLoading(true);
    try {
      if (user && accessToken) {
        // Logged in: Load from MongoDB
        console.log("📥 Loading games from MongoDB (gamesDB) for user:", user.email);
        const mongoGames = await gamesApi.getGames(accessToken);
        console.log("✅ Loaded", mongoGames.length, "games from MongoDB");
        setGames(mongoGames);
      } else if (db) {
        // Guest: Load from IndexedDB
        console.log("📥 Loading games from IndexedDB (Browser) - User not logged in");
        const indexedGames = await db.getAll("games");
        console.log("✅ Loaded", indexedGames.length, "games from IndexedDB");
        setGames(indexedGames);
      }
    } catch (error) {
      console.error("❌ Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, db, fetchGames, setGames]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Add game - MongoDB for logged-in users, IndexedDB for guests
  const addGame = useCallback(
    async (game: Chess) => {
      const gameToAdd = formatGameToDatabase(game);

      if (user && accessToken) {
        // Logged in: Save to MongoDB
        console.log("💾 Saving game to MongoDB (gamesDB) for user:", user.email);
        const createdGame = await gamesApi.createGame(accessToken, gameToAdd as Omit<Game, 'id'>);
        console.log("✅ Game saved to MongoDB with ID:", createdGame.id);
        await loadGames();
        return createdGame.id;
      } else if (db) {
        // Guest: Save to IndexedDB
        console.log("💾 Saving game to IndexedDB (Browser) - User not logged in");
        const gameId = await db.add("games", gameToAdd as Game);
        console.log("✅ Game saved to IndexedDB with ID:", gameId);
        await loadGames();
        return gameId;
      } else {
        throw new Error("Database not initialized");
      }
    },
    [user, accessToken, db, loadGames]
  );

  // Set game evaluation
  const setGameEval = useCallback(
    async (gameId: number | string, evaluation: GameEval) => {
      if (user && accessToken) {
        // Logged in: Update in MongoDB
        await gamesApi.updateGameEval(accessToken, String(gameId), evaluation);
        await loadGames();
      } else if (db) {
        // Guest: Update in IndexedDB
        const game = await db.get("games", Number(gameId));
        if (!game) throw new Error("Game not found");
        await db.put("games", { ...game, eval: evaluation });
        await loadGames();
      } else {
        throw new Error("Database not initialized");
      }
    },
    [user, accessToken, db, loadGames]
  );

  // Get single game
  const getGame = useCallback(
    async (gameId: number | string) => {
      if (user && accessToken) {
        // Logged in: Get from MongoDB
        return await gamesApi.getGame(accessToken, String(gameId));
      } else if (db) {
        // Guest: Get from IndexedDB
        return await db.get("games", Number(gameId));
      }
      return undefined;
    },
    [user, accessToken, db]
  );

  // Delete game
  const deleteGame = useCallback(
    async (gameId: number | string) => {
      if (user && accessToken) {
        // Logged in: Delete from MongoDB
        await gamesApi.deleteGame(accessToken, String(gameId));
        await loadGames();
      } else if (db) {
        // Guest: Delete from IndexedDB
        await db.delete("games", Number(gameId));
        await loadGames();
      } else {
        throw new Error("Database not initialized");
      }
    },
    [user, accessToken, db, loadGames]
  );

  // Handle gameId from URL
  const router = useRouter();
  const { gameId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    switch (typeof gameId) {
      case "string":
        getGame(gameId).then((game) => {
          setGameFromUrl(game || undefined);
        });
        break;
      default:
        setGameFromUrl(undefined);
    }
  }, [gameId, router.isReady, getGame]);

  const isReady = user ? true : db !== null;

  return {
    addGame,
    setGameEval,
    getGame,
    deleteGame,
    games,
    isReady,
    gameFromUrl,
    loading,
  };
};
