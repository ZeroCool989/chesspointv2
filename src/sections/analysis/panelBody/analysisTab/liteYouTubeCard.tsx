"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import {
  ytPlayersAtom,
  ytSelectedVideoIdAtom,
  ytTimestampsAtom,
  ytActivePlayerIdAtom,
  ytCurrentTimeAtom,
  ytIsPlayingAtom,
  YTPlayer,
} from "../../youtubeUiAtoms";

// Lazy load YouTube component to avoid SSR issues
const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

interface YouTubeEvent {
  target: any;
  data: number;
}

interface YouTubeProps {
  videoId: string;
  opts?: any;
  onReady?: (event: YouTubeEvent) => void;
  onStateChange?: (event: YouTubeEvent) => void;
  style?: React.CSSProperties;
  iframeClassName?: string;
}

interface LiteYouTubeCardProps {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount?: string;
  duration: string;
  publishedAt: string;
  matchLabel: string;
  isPinned: boolean;
  onPin: () => void;
}

function formatViewCount(count?: string): string {
  if (!count) return "";
  const num = parseInt(count);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num} views`;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0)
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function LiteYouTubeCard({
  videoId,
  title,
  channelTitle,
  thumbnailUrl,
  viewCount,
  duration,
  publishedAt,
  matchLabel,
  isPinned,
  onPin,
}: LiteYouTubeCardProps) {
  // Unique player instance ID
  const playerInstanceId = useMemo(() => `${videoId}-${Date.now()}`, [videoId]);

  const [showPlayer, setShowPlayer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Global state
  const [players, setPlayers] = useAtom(ytPlayersAtom);
  const [selectedVideoId, setSelectedVideoId] = useAtom(ytSelectedVideoIdAtom);
  const timestamps = useAtomValue(ytTimestampsAtom);
  const [activePlayerId, setActivePlayerId] = useAtom(ytActivePlayerIdAtom);
  const [currentTime, setCurrentTime] = useAtom(ytCurrentTimeAtom);
  const [isPlaying, setIsPlaying] = useAtom(ytIsPlayingAtom);

  const isSelected = selectedVideoId === videoId;
  const isActivePlayer = activePlayerId === playerInstanceId;
  const startSeconds = timestamps[videoId] ?? 0;

  // Pause all other players (legacy compatibility)
  const pauseAllExcept = useCallback(
    (exceptId: string) => {
      Object.entries(players).forEach(([id, player]) => {
        if (id !== exceptId && player) {
          try {
            player.pauseVideo();
          } catch (e) {
            console.warn("Failed to pause player", id, e);
          }
        }
      });
    },
    [players]
  );

  const handleThumbnailClick = useCallback(() => {
    setShowPlayer(true);
    setSelectedVideoId(videoId);
  }, [videoId, setSelectedVideoId]);

  const handleReady = useCallback(
    (event: YouTubeEvent) => {
      const player = event.target as unknown as YTPlayer;
      playerRef.current = player;
      setPlayerReady(true);

      // Register player in global registry (legacy)
      setPlayers((prev) => ({
        ...prev,
        [playerInstanceId]: player,
      }));

      // If we're becoming the active player, restore state
      if (activePlayerId === playerInstanceId) {
        try {
          player.seekTo(currentTime, true);
          if (isPlaying) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        } catch (e) {
          console.warn('Failed to restore player state:', e);
        }
      } else {
        // Cue video at the resolved timestamp (don't autoplay)
        try {
          player.cueVideoById({ videoId, startSeconds });
        } catch (e) {
          console.warn('Failed to cue video at timestamp:', e);
        }
      }
    },
    [videoId, playerInstanceId, setPlayers, startSeconds, activePlayerId, currentTime, isPlaying]
  );

  const handleStateChange = useCallback(
    (event: YouTubeEvent) => {
      const PlayerState = {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      };

      if (event.data === PlayerState.PLAYING) {
        // Become the active player
        setActivePlayerId(playerInstanceId);
        setIsPlaying(true);
        pauseAllExcept(playerInstanceId);
        setSelectedVideoId(videoId);

        // Start time update polling (250ms)
        if (timeUpdateIntervalRef.current === null) {
          timeUpdateIntervalRef.current = window.setInterval(() => {
            if (playerRef.current && isActivePlayer) {
              try {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);
              } catch (e) {
                console.warn('Failed to get current time:', e);
              }
            }
          }, 250);
        }
      } else if (event.data === PlayerState.PAUSED || event.data === PlayerState.ENDED) {
        setIsPlaying(false);

        // Stop time polling
        if (timeUpdateIntervalRef.current !== null) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
      }
    },
    [videoId, playerInstanceId, pauseAllExcept, setSelectedVideoId, setActivePlayerId, setIsPlaying, setCurrentTime, isActivePlayer]
  );

  const handlePlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setSelectedVideoId(videoId);
      setActivePlayerId(playerInstanceId);
    }
  }, [videoId, playerInstanceId, setSelectedVideoId, setActivePlayerId]);

  const handlePause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const handleStop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
      if (selectedVideoId === videoId) {
        setSelectedVideoId(null);
      }
      if (activePlayerId === playerInstanceId) {
        setActivePlayerId(null);
      }
    }
  }, [videoId, playerInstanceId, selectedVideoId, activePlayerId, setSelectedVideoId, setActivePlayerId, setIsPlaying]);

  const toggleExpand = useCallback(() => {
    if (!isExpanded && playerRef.current) {
      // Expanding: capture current state from player
      try {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      } catch (e) {
        console.warn('Failed to capture current time:', e);
      }
    }
    setIsExpanded((prev) => !prev);
  }, [isExpanded, setCurrentTime]);

  // Seek to new timestamp when position changes (only if not playing)
  useEffect(() => {
    if (playerReady && playerRef.current && !isPlaying && isActivePlayer) {
      try {
        // Use seekTo for precise decimal seconds
        playerRef.current.seekTo(startSeconds, true);
      } catch (e) {
        console.warn('Failed to seek to new timestamp:', e);
      }
    }
  }, [startSeconds, playerReady, isPlaying, isActivePlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear time polling interval
      if (timeUpdateIntervalRef.current !== null) {
        clearInterval(timeUpdateIntervalRef.current);
      }

      // Unregister player
      setPlayers((prev) => {
        const next = { ...prev };
        delete next[playerInstanceId];
        return next;
      });

      // Clear active player if it was us
      if (activePlayerId === playerInstanceId) {
        setActivePlayerId(null);
      }
    };
  }, [playerInstanceId, activePlayerId, setPlayers, setActivePlayerId]);

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
  };

  return (
    <>
      {/* Expanded mode overlay - ONLY render player here when expanded */}
      {isExpanded && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            padding: { xs: 2, md: 4 },
            overflowY: "auto",
          }}
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) {
              toggleExpand();
            }
          }}
        >
          <Box
            sx={{
              margin: "0 auto",
              width: "100%",
              maxWidth: "1400px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Player wrapper with correct aspect ratio */}
            <Box
              sx={{
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#000",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              {showPlayer && (
                <YouTube
                  key={`expanded-${playerInstanceId}`}
                  videoId={videoId}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      autoplay: 0,
                      rel: 0,
                      modestbranding: 1,
                      playsinline: 1,
                    },
                  }}
                  onReady={handleReady}
                  onStateChange={handleStateChange}
                  style={{ width: "100%", height: "100%" }}
                  iframeClassName="w-full h-full"
                />
              )}
            </Box>

            {/* Controls */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                size="medium"
                onClick={isPlaying ? handlePause : handlePlay}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(140, 108, 255, 0.2)",
                  "&:hover": { backgroundColor: "rgba(140, 108, 255, 0.3)" },
                }}
              >
                <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} height={24} />
              </IconButton>
              <IconButton
                size="medium"
                onClick={handleStop}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(140, 108, 255, 0.2)",
                  "&:hover": { backgroundColor: "rgba(140, 108, 255, 0.3)" },
                }}
              >
                <Icon icon="mdi:stop" height={24} />
              </IconButton>
              <IconButton
                size="medium"
                onClick={toggleExpand}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(140, 108, 255, 0.2)",
                  "&:hover": { backgroundColor: "rgba(140, 108, 255, 0.3)" },
                }}
              >
                <Icon icon="mdi:close" height={24} />
              </IconButton>
            </Stack>

            {/* Video info */}
            <Box sx={{ textAlign: "center", color: "#fff" }}>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                {channelTitle}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Card (normal mode) - HIDE player when expanded */}
      <Card
        sx={{
          backgroundColor: "#3B2B6E",
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.3s",
          border: isSelected ? "2px solid #8C6CFF" : "2px solid transparent",
          boxShadow: isSelected
            ? "0 0 20px rgba(140, 108, 255, 0.3)"
            : "0 2px 8px rgba(0,0,0,0.2)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 16px rgba(140, 108, 255, 0.2)",
          },
        }}
      >

        {/* Thumbnail or Player */}
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%",
            backgroundColor: "#000",
          }}
        >
        {!showPlayer ? (
          <>
            <CardMedia
              component="img"
              image={thumbnailUrl}
              alt={title}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Play overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.5)",
                },
              }}
              onClick={handleThumbnailClick}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "rgba(140, 108, 255, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Icon icon="mdi:play" height={40} color="#fff" />
              </Box>
            </Box>
            {/* Duration badge */}
            {duration && (
              <Chip
                label={formatDuration(duration)}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  height: 20,
                }}
              />
            )}
          </>
        ) : !isExpanded ? (
          // Only render card player when NOT expanded
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <YouTube
              key={`card-${playerInstanceId}`}
              videoId={videoId}
              opts={opts}
              onReady={handleReady}
              onStateChange={handleStateChange}
              style={{ width: "100%", height: "100%" }}
              iframeClassName="w-full h-full"
            />
          </Box>
        ) : null}
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 1.5, pb: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#fff",
            lineHeight: 1.3,
            minHeight: "2.6em",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          color="rgba(255,255,255,0.7)"
          sx={{ display: "block", mb: 0.5 }}
        >
          {channelTitle}
        </Typography>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
          <Chip
            label={matchLabel}
            size="small"
            sx={{
              backgroundColor: "#8C6CFF",
              color: "#fff",
              fontSize: "0.65rem",
              height: 18,
            }}
          />
          {viewCount && (
            <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ fontSize: "0.7rem" }}>
              {formatViewCount(viewCount)}
            </Typography>
          )}
          <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ fontSize: "0.7rem" }}>
            {formatPublishedDate(publishedAt)}
          </Typography>
        </Stack>

        {/* Controls */}
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
          {showPlayer ? (
            <>
              <IconButton
                size="small"
                onClick={isPlaying ? handlePause : handlePlay}
                sx={{ color: "#8C6CFF" }}
              >
                <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} height={20} />
              </IconButton>
              <IconButton size="small" onClick={handleStop} sx={{ color: "#8C6CFF" }}>
                <Icon icon="mdi:stop" height={20} />
              </IconButton>
              <IconButton
                size="small"
                onClick={toggleExpand}
                sx={{ color: "#8C6CFF" }}
                title={isExpanded ? "Minimize" : "Expand"}
              >
                <Icon icon={isExpanded ? "mdi:arrow-collapse" : "mdi:arrow-expand"} height={20} />
              </IconButton>
            </>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<Icon icon="mdi:play" />}
              onClick={handleThumbnailClick}
              sx={{
                backgroundColor: "#8C6CFF",
                color: "#fff",
                textTransform: "none",
                fontSize: "0.75rem",
                py: 0.5,
                "&:hover": {
                  backgroundColor: "#9D7FFF",
                },
              }}
            >
              Play
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="small"
            onClick={onPin}
            sx={{
              color: isPinned ? "#FFD700" : "rgba(255,255,255,0.5)",
              "&:hover": {
                color: isPinned ? "#FFC700" : "#FFD700",
              },
            }}
          >
            <Icon icon={isPinned ? "mdi:pin" : "mdi:pin-outline"} height={18} />
          </IconButton>
        </Stack>
        </CardContent>
      </Card>
    </>
  );
}
