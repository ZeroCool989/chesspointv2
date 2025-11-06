import type { NextApiRequest, NextApiResponse } from 'next';

export interface CaptionSegment {
  start: number;
  duration: number;
  text: string;
}

/**
 * API endpoint to fetch YouTube video captions/transcripts.
 * Uses youtube-transcript library to get auto-generated or manual captions.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CaptionSegment[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'videoId is required' });
  }

  try {
    // Dynamic import to avoid build issues
    const { YoutubeTranscript } = await import('youtube-transcript');

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Transform to our format
    const segments: CaptionSegment[] = transcript.map((item: any) => ({
      start: item.offset / 1000, // Convert ms to seconds
      duration: item.duration / 1000,
      text: item.text,
    }));

    res.status(200).json(segments);
  } catch (error: any) {
    console.error('Caption fetch error:', error);

    // Common error: captions disabled or not available
    if (error.message?.includes('transcript') || error.message?.includes('disabled')) {
      return res.status(404).json({ error: 'Captions not available for this video' });
    }

    res.status(500).json({ error: error.message || 'Failed to fetch captions' });
  }
}
