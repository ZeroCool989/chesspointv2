import { atom } from "jotai";

// YouTube Player type (extended from YT.Player)
export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getPlayerState: () => number;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
}

export const ytPlayersAtom = atom<Record<string, YTPlayer | null>>({});
export const ytSelectedVideoIdAtom = atom<string | null>(null);
export const ytPinnedIdsAtom = atom<string[]>([]);
export const ytAutoFilterAtom = atom(true);
export const ytMaxResultsAtom = atom(3);
export const ytManualQueryAtom = atom<string>("");

// Store resolved timestamps for each video at current position
// key: videoId, value: startSeconds for the current position
export const ytTimestampsAtom = atom<Record<string, number>>({});

// Singleton playback control (prevents echo on expand/collapse)
export const ytActivePlayerIdAtom = atom<string | null>(null); // Unique ID of the active player instance
export const ytCurrentTimeAtom = atom<number>(0); // Current playback position in seconds (decimal)
export const ytIsPlayingAtom = atom<boolean>(false); // Is video currently playing?
export const ytPlayerKeyAtom = atom<number>(0); // Increment to force player remount (for HMR/cleanup)
