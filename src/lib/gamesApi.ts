import { fetchWithAuth } from './api';
import { Game } from '@/types/game';
import { GameEval } from '@/types/eval';

async function parseJsonSafe<T = unknown>(res: Response): Promise<T | {}> {
  try {
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : {};
  } catch {
    return {};
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  const msg =
    (data as { error?: string })?.error ||
    (typeof data === "object" && data && "message" in (data as any) && (data as any).message) ||
    null;
  return (msg as string) || fallback;
}

export interface GamesResponse {
  games: Game[];
}

export interface GameResponse {
  game: Game;
}

/** Get all games for authenticated user */
export async function getGames(accessToken: string): Promise<Game[]> {
  try {
    const res = await fetchWithAuth(
      '/api/games',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      accessToken,
      undefined,
      { tryRefresh: true }
    );

    const data = (await parseJsonSafe<GamesResponse | { error: string }>(res)) as
      | GamesResponse
      | { error: string };

    if (!res.ok) {
      throw new Error(getErrorMessage(data, 'Failed to fetch games'));
    }

    return (data as GamesResponse).games;
  } catch (error) {
    console.error('❌ Error fetching games:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Backend server is not running or not reachable. Please check if the backend is running on port 4001.');
    }
    throw error;
  }
}

/** Get single game by ID */
export async function getGame(accessToken: string, gameId: string): Promise<Game | null> {
  const res = await fetchWithAuth(
    `/api/games/${gameId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    accessToken,
    undefined,
    { tryRefresh: true }
  );

  if (res.status === 404) {
    return null;
  }

  const data = (await parseJsonSafe<GameResponse | { error: string }>(res)) as
    | GameResponse
    | { error: string };

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Failed to fetch game'));
  }

  return (data as GameResponse).game;
}

/** Create new game */
export async function createGame(accessToken: string, gameData: Omit<Game, 'id'>): Promise<Game> {
  const res = await fetchWithAuth(
    '/api/games',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData),
    },
    accessToken,
    undefined,
    { tryRefresh: true }
  );

  const data = (await parseJsonSafe<GameResponse | { error: string }>(res)) as
    | GameResponse
    | { error: string };

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Failed to create game'));
  }

  return (data as GameResponse).game;
}

/** Update game evaluation */
export async function updateGameEval(
  accessToken: string,
  gameId: string,
  evaluation: GameEval
): Promise<Game> {
  const res = await fetchWithAuth(
    `/api/games/${gameId}/eval`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eval: evaluation }),
    },
    accessToken,
    undefined,
    { tryRefresh: true }
  );

  const data = (await parseJsonSafe<GameResponse | { error: string }>(res)) as
    | GameResponse
    | { error: string };

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Failed to update game evaluation'));
  }

  return (data as GameResponse).game;
}

/** Delete game */
export async function deleteGame(accessToken: string, gameId: string): Promise<void> {
  const res = await fetchWithAuth(
    `/api/games/${gameId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
    accessToken,
    undefined,
    { tryRefresh: true }
  );

  if (!res.ok) {
    const data = (await parseJsonSafe<{ error: string }>(res)) as { error: string };
    throw new Error(getErrorMessage(data, 'Failed to delete game'));
  }
}

