/**
 * Music file URLs using Google Drive
 * Extracts file IDs from iframe preview URLs and converts to direct download links
 * 
 * Iframe format: https://drive.google.com/file/d/FILE_ID/preview
 * Direct format: https://drive.google.com/uc?export=download&id=FILE_ID
 */

/**
 * Extract file ID from Google Drive iframe URL
 * @param iframeUrl - Google Drive iframe URL (https://drive.google.com/file/d/FILE_ID/preview)
 * @returns File ID or null if invalid
 */
export function extractFileIdFromIframe(iframeUrl: string): string | null {
  const match = iframeUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Convert iframe URL to direct download URL
 * For audio playback, we need a streaming URL that works with HTML5 audio
 * @param iframeUrl - Google Drive iframe URL
 * @returns Direct streaming URL for audio playback
 */
export function iframeToDirectUrl(iframeUrl: string): string {
  const fileId = extractFileIdFromIframe(iframeUrl);
  if (!fileId) {
    // If not an iframe URL, return as-is
    return iframeUrl;
  }
  // Use this format for audio streaming (requires file to be publicly shared)
  // Alternative: https://drive.google.com/uc?export=download&id=${fileId}&confirm=t
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

/**
 * Get backend API URL for music proxy
 * Uses backend proxy to bypass CORS restrictions
 * Uses same port as API_URL (from api.ts)
 */
const getBackendUrl = (): string => {
  // Use NEXT_PUBLIC_API_URL or default to localhost:4001 (same as API_URL in api.ts)
  if (typeof window !== 'undefined') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    return apiUrl;
  }
  return 'http://localhost:4001';
};

/**
 * Music track URLs - Using backend proxy to bypass CORS
 * Backend fetches from Google Drive and streams with proper CORS headers
 */
export const MUSIC_TRACKS = [
  {
    label: 'Lofi at the 64 squares',
    src: `${getBackendUrl()}/music/1ruDE9bDPzNQCx0b1wakkxZw3kVnLxZ87`,
    fileId: '1ruDE9bDPzNQCx0b1wakkxZw3kVnLxZ87',
    iframeUrl: 'https://drive.google.com/file/d/1ruDE9bDPzNQCx0b1wakkxZw3kVnLxZ87/preview',
  },
  {
    label: 'Idea Factory Elo Boost',
    src: `${getBackendUrl()}/music/1FmEi_gT7uXqWu4T9JAmjVltdcOTgJOoD`,
    fileId: '1FmEi_gT7uXqWu4T9JAmjVltdcOTgJOoD',
    iframeUrl: 'https://drive.google.com/file/d/1FmEi_gT7uXqWu4T9JAmjVltdcOTgJOoD/preview',
  },
  {
    label: 'White Noise Gambit',
    src: `${getBackendUrl()}/music/18QLsTyduh6ksdRjWK6TfZ9HcKYHdjsDW`,
    fileId: '18QLsTyduh6ksdRjWK6TfZ9HcKYHdjsDW',
    iframeUrl: 'https://drive.google.com/file/d/18QLsTyduh6ksdRjWK6TfZ9HcKYHdjsDW/preview',
  },
  {
    label: 'Kings Clarity 857 hz',
    src: `${getBackendUrl()}/music/1zIVMAGhQXO4DiILMTycX9ctoGuUlE_NP`,
    fileId: '1zIVMAGhQXO4DiILMTycX9ctoGuUlE_NP',
    iframeUrl: 'https://drive.google.com/file/d/1zIVMAGhQXO4DiILMTycX9ctoGuUlE_NP/preview',
  },
  {
    label: 'The Grand Game',
    src: `${getBackendUrl()}/music/13tnd0_BrxahjFhXJKG6mcpHe0gdJZT7z`,
    fileId: '13tnd0_BrxahjFhXJKG6mcpHe0gdJZT7z',
    iframeUrl: 'https://drive.google.com/file/d/13tnd0_BrxahjFhXJKG6mcpHe0gdJZT7z/preview',
  },
];

/**
 * Get all music tracks (synchronous, no async needed)
 */
export function getMusicTracks(): Array<{ label: string; src: string }> {
  return MUSIC_TRACKS.map(({ label, src }) => ({ label, src }));
}

/**
 * Get music URL (for compatibility)
 */
export function getMusicUrl(filename: string): string {
  // Find track by filename or return first track
  const track = MUSIC_TRACKS.find(t => t.label.toLowerCase().includes(filename.toLowerCase()));
  return track?.src || MUSIC_TRACKS[0].src;
}

/**
 * Get iframe URL for a track (for embedding)
 */
export function getIframeUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

