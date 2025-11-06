import { positionSignature } from './positionSignature';
import { findMoveInText, sanToSpokenVariations } from './sanSpeechMap';
import type { CaptionSegment } from '@/pages/api/youtube/captions';

interface OpeningInfo {
  eco?: string;
  name?: string;
}

interface TimestampCache {
  [key: string]: number | null; // key: `${videoId}:${positionSig}`, value: timestamp or null
}

const timestampCache: TimestampCache = {};

interface ChapterTimestamp {
  time: number;
  title: string;
}

/**
 * Parse chapter timestamps from video description.
 * Matches patterns like: 0:00, 1:23, 12:34, 1:23:45
 */
function parseChapterTimestamps(description: string): ChapterTimestamp[] {
  const chapters: ChapterTimestamp[] = [];

  // Match timestamps with optional hours: (HH:)?MM:SS
  const regex = /\b(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\b/g;
  const lines = description.split('\n');

  lines.forEach(line => {
    let match;
    while ((match = regex.exec(line)) !== null) {
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // Extract nearby text as chapter title (context around timestamp)
      const startIdx = Math.max(0, match.index - 5);
      const endIdx = Math.min(line.length, match.index + match[0].length + 50);
      const context = line.slice(startIdx, endIdx).trim();

      chapters.push({
        time: totalSeconds,
        title: context,
      });
    }
  });

  return chapters.sort((a, b) => a.time - b.time);
}

/**
 * Try to match position to a chapter timestamp.
 */
function matchChapterTimestamp(
  chapters: ChapterTimestamp[],
  openingInfo: OpeningInfo | undefined,
  historySAN: string[]
): number | null {
  if (chapters.length === 0) return null;

  const openingName = openingInfo?.name?.toLowerCase();
  const eco = openingInfo?.eco?.toLowerCase();
  const firstMoves = historySAN.slice(0, 10).map(m => m.toLowerCase());

  // Try to find a chapter matching opening or moves
  for (const chapter of chapters) {
    const chapterTitle = chapter.title.toLowerCase();

    // Check ECO code
    if (eco && chapterTitle.includes(eco)) {
      return chapter.time;
    }

    // Check opening name
    if (openingName && chapterTitle.includes(openingName)) {
      return chapter.time;
    }

    // Check for move sequences
    let consecutiveMatches = 0;
    for (const move of firstMoves) {
      if (chapterTitle.includes(move)) {
        consecutiveMatches++;
      }
    }

    if (consecutiveMatches >= 3) {
      return chapter.time;
    }
  }

  return null;
}

/**
 * Fetch captions from our API endpoint.
 */
async function fetchCaptions(videoId: string): Promise<CaptionSegment[] | null> {
  try {
    const response = await fetch(`/api/youtube/captions?videoId=${videoId}`);

    if (!response.ok) {
      console.warn(`Captions not available for ${videoId}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Caption fetch error:', error);
    return null;
  }
}

/**
 * Search captions for move discussions using binary search.
 * Returns the precise timestamp (decimal seconds) of the best match.
 */
function searchCaptionsForMoves(
  captions: CaptionSegment[],
  historySAN: string[]
): number | null {
  if (captions.length === 0 || historySAN.length === 0) return null;

  // Search for the first 8-12 moves
  const movesToSearch = historySAN.slice(0, 12);

  let bestMatch: { time: number; matchCount: number } | null = null;

  // Sliding window: check each caption segment for move sequences
  captions.forEach((segment, idx) => {
    // Combine this segment with next few for context
    const contextEnd = Math.min(idx + 5, captions.length);
    const combinedText = captions
      .slice(idx, contextEnd)
      .map(s => s.text)
      .join(' ')
      .toLowerCase();

    let consecutiveMatches = 0;
    for (const move of movesToSearch) {
      if (findMoveInText(move, combinedText)) {
        consecutiveMatches++;
      } else {
        break;
      }
    }

    // If we found at least 2 consecutive moves, this is a strong match
    if (consecutiveMatches >= 2) {
      if (!bestMatch || consecutiveMatches > bestMatch.matchCount) {
        // Use exact segment.start (decimal) and subtract 2.5s for context (not 5s)
        // Clamp to 0 to avoid negative timestamps
        const preciseTime = Math.max(0, segment.start - 2.5);
        bestMatch = {
          time: preciseTime,
          matchCount: consecutiveMatches,
        };
      }
    }
  });

  return bestMatch ? bestMatch.time : null;
}

/**
 * Binary search to find the nearest chapter/marker at or before the target move index.
 * Returns the timestamp (decimal seconds) of the best match.
 */
function binarySearchChapters(
  chapters: ChapterTimestamp[],
  targetMoveCount: number
): number | null {
  if (chapters.length === 0) return null;

  // Simple strategy: return the first chapter if we have moves (opening stage)
  // For more sophisticated matching, you could parse chapter titles for move numbers
  return chapters[0].time;
}

/**
 * Main resolver: returns the best timestamp for a position in a video.
 * Pipeline:
 * 1. Check cache
 * 2. Try chapter timestamps from description
 * 3. Try auto captions (server-side)
 * 4. Fallback to beginning or first chapter
 */
export async function resolveTimestampForPosition(
  videoId: string,
  fen: string,
  historySAN: string[],
  description: string = '',
  openingInfo?: OpeningInfo
): Promise<number | null> {
  const sig = positionSignature(fen);
  const cacheKey = `${videoId}:${sig}`;

  // Check cache first
  if (cacheKey in timestampCache) {
    return timestampCache[cacheKey];
  }

  let timestamp: number | null = null;

  // Step 1: Chapter timestamps
  const chapters = parseChapterTimestamps(description);
  timestamp = matchChapterTimestamp(chapters, openingInfo, historySAN);

  if (timestamp !== null) {
    timestampCache[cacheKey] = timestamp;
    return timestamp;
  }

  // Step 2: Auto captions (async)
  try {
    const captions = await fetchCaptions(videoId);
    if (captions) {
      timestamp = searchCaptionsForMoves(captions, historySAN);
    }
  } catch (error) {
    console.warn('Caption search failed:', error);
  }

  if (timestamp !== null) {
    timestampCache[cacheKey] = timestamp;
    return timestamp;
  }

  // Step 3: Fallback
  // If opening info matches title/description and no specific timestamp found,
  // default to first chapter or 0
  if (openingInfo && chapters.length > 0) {
    timestamp = chapters[0].time;
  } else {
    timestamp = 0;
  }

  timestampCache[cacheKey] = timestamp;
  return timestamp;
}

/**
 * Clear cache for a specific video (useful when video metadata changes).
 */
export function clearTimestampCache(videoId?: string) {
  if (videoId) {
    Object.keys(timestampCache).forEach(key => {
      if (key.startsWith(`${videoId}:`)) {
        delete timestampCache[key];
      }
    });
  } else {
    // Clear all
    Object.keys(timestampCache).forEach(key => delete timestampCache[key]);
  }
}
