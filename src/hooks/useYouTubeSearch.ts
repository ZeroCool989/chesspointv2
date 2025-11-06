import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { ytCacheAtom, YTFilters, YTVideoResult } from "@/sections/analysis/youtubeAtoms";

interface OpeningInfo {
  eco?: string;
  name?: string;
}

interface UseYouTubeSearchParams {
  fen: string;
  historySAN: string[];
  openingInfo?: OpeningInfo;
  filters: YTFilters;
  auto: boolean;
  enabled: boolean;
  manualQuery?: string;
}

interface UseYouTubeSearchResult {
  results: YTVideoResult[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  search: (query: string) => void;
}

function positionSignature(fen: string): string {
  const parts = fen.split(' ');
  // side to move + castling + pawn structure (files with pawns)
  const board = parts[0] || '';
  const sideToMove = parts[1] || 'w';
  const castling = parts[2] || '-';

  // Extract pawn files
  const ranks = board.split('/');
  const pawnFiles = new Set<string>();
  ranks.forEach((rank, rankIdx) => {
    let file = 0;
    for (const char of rank) {
      if (/\d/.test(char)) {
        file += parseInt(char);
      } else {
        if (char.toLowerCase() === 'p') {
          pawnFiles.add(String.fromCharCode(97 + file)); // a-h
        }
        file++;
      }
    }
  });

  return `${sideToMove}_${castling}_${Array.from(pawnFiles).sort().join('')}`;
}

function generateQueries(
  fen: string,
  historySAN: string[],
  openingInfo?: OpeningInfo
): string[] {
  const queries: string[] = [];

  // Priority 1: Opening-based query
  if (openingInfo?.eco && openingInfo?.name) {
    queries.push(`${openingInfo.eco} ${openingInfo.name} chess ideas`);
  }

  // Priority 2: Opening moves explained
  if (openingInfo?.name || historySAN.length > 0) {
    const firstMoves = historySAN.slice(0, Math.min(10, historySAN.length)).join(' ');
    const openingName = openingInfo?.name || 'chess';
    queries.push(`${openingName} ${firstMoves} explained`.trim());
  }

  // Priority 3: Generic position-based query
  const sideToMove = fen.split(' ')[1] === 'w' ? 'white' : 'black';
  const parts = fen.split(' ')[0];
  const ranks = parts.split('/');
  const pawnFiles = new Set<string>();

  ranks.forEach((rank) => {
    let file = 0;
    for (const char of rank) {
      if (/\d/.test(char)) {
        file += parseInt(char);
      } else {
        if (char.toLowerCase() === 'p') {
          pawnFiles.add(String.fromCharCode(97 + file));
        }
        file++;
      }
    }
  });

  const majorPawnFiles = Array.from(pawnFiles).slice(0, 3).join(',');
  queries.push(`chess ${sideToMove} plans ${majorPawnFiles || 'middlegame'}`);

  return queries;
}

export function useYouTubeSearch({
  fen,
  historySAN,
  openingInfo,
  filters,
  auto,
  enabled,
  manualQuery,
}: UseYouTubeSearchParams): UseYouTubeSearchResult {
  const [cache, setCache] = useAtom(ytCacheAtom);
  const [results, setResults] = useState<YTVideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [currentQuery, setCurrentQuery] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const signature = positionSignature(fen);

  const fetchVideos = useCallback(
    async (query: string, pageToken?: string) => {
      if (!enabled) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: query,
          duration: filters.duration,
          order: filters.sort,
          lang: filters.lang,
        });

        if (pageToken) {
          params.append('pageToken', pageToken);
        }

        const response = await fetch(`/api/youtube/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Dedupe by videoId
        const newResults = data.items || [];
        setResults((prev) => {
          const existingIds = new Set(prev.map((r) => r.videoId));
          const uniqueNew = newResults.filter((r: YTVideoResult) => !existingIds.has(r.videoId));
          return pageToken ? [...prev, ...uniqueNew] : uniqueNew;
        });

        setNextPageToken(data.nextPageToken);

        // Update cache for non-paginated searches
        if (!pageToken && newResults.length > 0) {
          setCache((prev) => ({
            ...prev,
            [signature]: newResults,
          }));
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Failed to fetch videos');
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [enabled, filters, signature, setCache]
  );

  const loadMore = useCallback(() => {
    if (nextPageToken && currentQuery) {
      fetchVideos(currentQuery, nextPageToken);
    }
  }, [nextPageToken, currentQuery, fetchVideos]);

  const search = useCallback(
    (query: string) => {
      setCurrentQuery(query);
      setNextPageToken(undefined);
      fetchVideos(query);
    },
    [fetchVideos]
  );

  // Manual search override
  useEffect(() => {
    if (!enabled || !manualQuery) return;

    search(manualQuery);
  }, [manualQuery, enabled, search]);

  // Auto-search on FEN change with debounce
  useEffect(() => {
    if (!enabled || !auto || manualQuery) return;

    // Check cache first
    if (cache[signature]) {
      setResults(cache[signature]);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const queries = generateQueries(fen, historySAN, openingInfo);
      const topQuery = queries[0];
      setCurrentQuery(topQuery);
      fetchVideos(topQuery);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fen, auto, enabled, signature, cache, historySAN, openingInfo, fetchVideos, manualQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    loadMore,
    hasMore: !!nextPageToken,
    search,
  };
}
