"use client";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Grid2 as Grid,
  Skeleton,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtom } from "jotai";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { boardAtom, currentPositionAtom } from "../../states";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";
import { ytPanelOpenAtom, ytFiltersAtom, YTVideoResult } from "../../youtubeAtoms";
import {
  ytSelectedVideoIdAtom,
  ytPinnedIdsAtom,
  ytAutoFilterAtom,
  ytMaxResultsAtom,
  ytManualQueryAtom,
  ytTimestampsAtom,
} from "../../youtubeUiAtoms";
import { useAtomLocalStorage } from "@/hooks/useAtomLocalStorage";
import LiteYouTubeCard from "./liteYouTubeCard";
import { resolveTimestampForPosition } from "@/lib/resolveTimestampForPosition";

interface OpeningInfo {
  eco?: string;
  name?: string;
}

function parseOpeningInfo(openingString?: string): OpeningInfo | undefined {
  if (!openingString) return undefined;

  const ecoMatch = openingString.match(/\b([A-E]\d{2})\b/);
  const eco = ecoMatch?.[1];
  const name = openingString.replace(/\b[A-E]\d{2}\b/g, "").trim();

  return { eco, name: name || openingString };
}

interface ScoredVideo extends YTVideoResult {
  relevanceScore: number;
  matchDetails: string;
}

function computeRelevanceScore(
  video: YTVideoResult,
  openingInfo: OpeningInfo | undefined,
  historySAN: string[],
  fen: string
): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];

  const titleLower = video.title.toLowerCase();
  const channelLower = video.channelTitle.toLowerCase();

  // Opening match (high priority)
  if (openingInfo?.eco) {
    if (titleLower.includes(openingInfo.eco.toLowerCase())) {
      score += 100;
      details.push(`ECO ${openingInfo.eco}`);
    }
    if (openingInfo.name && titleLower.includes(openingInfo.name.toLowerCase())) {
      score += 80;
      details.push(`Opening name`);
    }
  }

  // SAN move sequence match
  if (historySAN.length > 0) {
    const moveString = historySAN.slice(0, 10).join(" ").toLowerCase();
    const words = moveString.split(" ");

    let consecutiveMatches = 0;
    for (let i = 0; i < words.length; i++) {
      if (titleLower.includes(words[i])) {
        consecutiveMatches++;
      } else {
        break;
      }
    }

    if (consecutiveMatches > 0) {
      score += consecutiveMatches * 10;
      details.push(`${consecutiveMatches} moves`);
    }
  }

  // FEN-based pawn structure match
  const parts = fen.split(" ");
  const sideToMove = parts[1] === "w" ? "white" : "black";

  if (titleLower.includes(sideToMove)) {
    score += 5;
  }

  // Prefer popular videos
  if (video.viewCount) {
    const views = parseInt(video.viewCount);
    if (views > 1_000_000) score += 20;
    else if (views > 100_000) score += 10;
    else if (views > 10_000) score += 5;
  }

  // Prefer recent videos
  const publishedDate = new Date(video.publishedAt);
  const ageInDays = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 30) score += 10;
  else if (ageInDays < 180) score += 5;

  // Prefer certain channels (optional - customize)
  const popularChannels = ["gothamchess", "chessbrah", "agadmator", "hanging pawns"];
  if (popularChannels.some((ch) => channelLower.includes(ch))) {
    score += 15;
    details.push("Popular channel");
  }

  return {
    score,
    details: details.length > 0 ? details.join(" • ") : "Position match",
  };
}

export default function YouTubeLearningPanel() {
  const [board] = useAtom(boardAtom);
  const [position] = useAtom(currentPositionAtom);

  const [panelOpen, setPanelOpen] = useAtomLocalStorage("ytPanelOpen", ytPanelOpenAtom);
  const [filters] = useAtomLocalStorage("ytFilters", ytFiltersAtom);
  const [pinnedIdsArray, setPinnedIdsArray] = useAtomLocalStorage("ytPinnedIds", ytPinnedIdsAtom);
  const [autoFilter, setAutoFilter] = useAtomLocalStorage("ytAutoFilter", ytAutoFilterAtom);
  const [maxResults, setMaxResults] = useAtomLocalStorage("ytMaxResults", ytMaxResultsAtom);
  const [manualQuery, setManualQuery] = useAtomLocalStorage("ytManualQuery", ytManualQueryAtom);
  const [timestamps, setTimestamps] = useAtom(ytTimestampsAtom);

  // Convert array to Set for easy .has() checks
  const pinnedVideos = useMemo(() => {
    if (!pinnedIdsArray) return new Set<string>();
    if (Array.isArray(pinnedIdsArray)) return new Set(pinnedIdsArray);
    return new Set<string>();
  }, [pinnedIdsArray]);

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [manualSearchActive, setManualSearchActive] = useState(false);

  // Clean up corrupted localStorage data on mount
  useEffect(() => {
    if (pinnedIdsArray && !Array.isArray(pinnedIdsArray)) {
      console.warn("Corrupted pinned videos data, resetting...");
      setPinnedIdsArray([]);
    }
  }, [pinnedIdsArray, setPinnedIdsArray]);

  // Memoize fen and historySAN to prevent new references on every render
  const fen = useMemo(() => board.fen(), [board]);
  const historySAN = useMemo(() => board.history(), [board]);

  const openingString = position?.eval?.opening || position?.opening;
  const openingInfo = useMemo(() => parseOpeningInfo(openingString), [openingString]);

  const { results, loading, error, loadMore, hasMore, search } = useYouTubeSearch({
    fen,
    historySAN,
    openingInfo,
    filters,
    auto: true,
    enabled: panelOpen,
    manualQuery: manualSearchActive ? manualQuery : undefined,
  });

  // Score and filter results
  const filteredResults = useMemo(() => {
    if (!autoFilter && !manualSearchActive) {
      return results.slice(0, maxResults);
    }

    // Score all videos
    const scored: ScoredVideo[] = results.map((video) => {
      const { score, details } = computeRelevanceScore(video, openingInfo, historySAN, fen);
      return {
        ...video,
        relevanceScore: score,
        matchDetails: details,
      };
    });

    // Sort by score
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Pinned videos always appear first
    const pinned = scored.filter((v) => pinnedVideos.has(v.videoId));
    const unpinned = scored.filter((v) => !pinnedVideos.has(v.videoId)).slice(0, maxResults);

    return [...pinned, ...unpinned];
  }, [results, autoFilter, manualSearchActive, maxResults, openingInfo, historySAN, fen, pinnedVideos]);

  const handlePin = useCallback(
    (videoId: string) => {
      setPinnedIdsArray((prev) => {
        const arr = prev || [];
        if (arr.includes(videoId)) {
          return arr.filter((id) => id !== videoId);
        } else {
          return [...arr, videoId];
        }
      });
    },
    [setPinnedIdsArray]
  );

  const handleManualSearch = useCallback(() => {
    if (manualQuery.trim()) {
      setManualSearchActive(true);
      search(manualQuery);
    }
  }, [manualQuery, search]);

  // Track mount state and abort controller
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchedVideosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Resolve timestamps for visible videos when position changes
  useEffect(() => {
    if (!filteredResults || filteredResults.length === 0) return;

    // Abort previous fetches
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const resolveTimestamps = async () => {
      const newTimestamps: Record<string, number> = {};

      for (const video of filteredResults) {
        if (abortController.signal.aborted) break;

        // Only fetch once per video+position
        const cacheKey = `${video.videoId}:${fen}`;
        if (fetchedVideosRef.current.has(cacheKey)) {
          continue;
        }
        fetchedVideosRef.current.add(cacheKey);

        try {
          const timestamp = await resolveTimestampForPosition(
            video.videoId,
            fen,
            historySAN,
            video.description || '',
            openingInfo
          );
          if (timestamp !== null && !abortController.signal.aborted) {
            newTimestamps[video.videoId] = timestamp;
          }
        } catch (error) {
          console.warn(`Failed to resolve timestamp for ${video.videoId}:`, error);
        }
      }

      // Only update if mounted and not aborted
      if (isMountedRef.current && !abortController.signal.aborted) {
        setTimestamps((prev) => {
          // Deep equality check to prevent unnecessary re-renders
          const prevKeys = Object.keys(prev).sort();
          const newKeys = Object.keys(newTimestamps).sort();

          const keysMatch = prevKeys.length === newKeys.length &&
                           prevKeys.every((k, i) => k === newKeys[i]);

          if (keysMatch && prevKeys.every((k) => prev[k] === newTimestamps[k])) {
            return prev; // Same data, return existing reference
          }

          return newTimestamps;
        });
      }
    };

    resolveTimestamps();

    return () => {
      abortController.abort();
    };
  }, [filteredResults, fen, historySAN, openingInfo, setTimestamps]);

  return (
    <Box
      sx={{
        width: "100%",
        mt: 3,
        backgroundColor: "rgba(59, 43, 110, 0.3)",
        borderRadius: 2,
        border: "1px solid rgba(140, 108, 255, 0.2)",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          cursor: "pointer",
        }}
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="mdi:youtube" height={24} color="#FF0000" />
          <Typography variant="h6" fontWeight={600} color="#fff">
            YouTube Learning
          </Typography>
          {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Box>
        <IconButton size="small" sx={{ color: "#8C6CFF" }}>
          <Icon icon={panelOpen ? "mdi:chevron-up" : "mdi:chevron-down"} height={24} />
        </IconButton>
      </Box>

      <Collapse in={panelOpen}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Controls */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Manual search */}
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Manual search (optional)..."
                value={manualQuery}
                onChange={(e) => {
                  setManualQuery(e.target.value);
                  setManualSearchActive(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualSearch();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(59, 43, 110, 0.5)",
                    color: "#fff",
                    "& fieldset": {
                      borderColor: "rgba(140, 108, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(140, 108, 255, 0.5)",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleManualSearch}
                sx={{
                  backgroundColor: "#8C6CFF",
                  "&:hover": { backgroundColor: "#9D7FFF" },
                }}
              >
                Search
              </Button>
            </Stack>

            {/* Settings row */}
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoFilter}
                    onChange={(e) => setAutoFilter(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#8C6CFF",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#8C6CFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" color="#fff">
                    Auto-filter on move
                  </Typography>
                }
              />

              <Box sx={{ minWidth: 200 }}>
                <Typography variant="caption" color="#fff" sx={{ mb: 0.5, display: "block" }}>
                  Max results: {maxResults}
                </Typography>
                <Slider
                  value={maxResults}
                  onChange={(_, value) => setMaxResults(value as number)}
                  min={1}
                  max={6}
                  marks
                  size="small"
                  sx={{
                    color: "#8C6CFF",
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#8C6CFF",
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "#8C6CFF",
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "rgba(140, 108, 255, 0.3)",
                    },
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Error state */}
          {error && (
            <Alert severity="error" sx={{ backgroundColor: "rgba(211, 47, 47, 0.1)" }}>
              {error}
            </Alert>
          )}

          {/* Loading skeleton */}
          {loading && results.length === 0 && (
            <Grid container spacing={2}>
              {[1, 2, 3].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 2, backgroundColor: "rgba(59, 43, 110, 0.5)" }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Video grid */}
          {filteredResults.length > 0 && (
            <Grid container spacing={2}>
              {filteredResults.map((video) => (
                <Grid key={video.videoId} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <LiteYouTubeCard
                    videoId={video.videoId}
                    title={video.title}
                    channelTitle={video.channelTitle}
                    thumbnailUrl={video.thumbnails.medium || video.thumbnails.default}
                    viewCount={video.viewCount}
                    duration={video.duration}
                    publishedAt={video.publishedAt}
                    matchLabel={
                      "matchDetails" in video
                        ? (video as ScoredVideo).matchDetails
                        : "Relevant"
                    }
                    isPinned={pinnedVideos.has(video.videoId)}
                    onPin={() => handlePin(video.videoId)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Load more */}
          {hasMore && !autoFilter && (
            <Button
              variant="outlined"
              size="small"
              onClick={loadMore}
              disabled={loading}
              startIcon={
                loading ? (
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : (
                  <Icon icon="mdi:chevron-down" />
                )
              }
              sx={{
                borderColor: "#8C6CFF",
                color: "#8C6CFF",
                "&:hover": {
                  borderColor: "#9D7FFF",
                  backgroundColor: "rgba(140, 108, 255, 0.1)",
                },
              }}
            >
              Load More
            </Button>
          )}

          {/* Empty state */}
          {!loading && filteredResults.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Icon icon="mdi:video-off" height={48} color="rgba(255,255,255,0.3)" />
              <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mt: 2 }}>
                No videos found for this position.
                <br />
                Try making moves or adjusting filters.
              </Typography>
            </Box>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}
