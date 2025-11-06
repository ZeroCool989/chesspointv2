import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID parameter is required' });
  }

  const apiKey = process.env.YT_API_KEY;
  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE' || apiKey === 'test') {
    return res.status(404).json({ error: 'YouTube API key not configured' });
  }

  try {
    // Get captions for the video
    const params = new URLSearchParams({
      part: 'snippet',
      videoId: videoId,
      key: apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?${params.toString()}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Captions not available for this video' });
      }
      return res.status(response.status).json({ error: 'Failed to fetch captions' });
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Captions not available for this video' });
    }

    // Get the first available caption track
    const captionId = data.items[0].id;
    
    // Download the caption content
    const captionParams = new URLSearchParams({
      key: apiKey,
      tfmt: 'srt', // SRT format
    });

    const captionResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?${captionParams.toString()}`,
      {
        headers: {
          'Accept': 'text/plain',
        },
      }
    );

    if (!captionResponse.ok) {
      return res.status(404).json({ error: 'Failed to download captions' });
    }

    const captionText = await captionResponse.text();

    return res.status(200).json({
      captions: captionText,
      captionId: captionId,
    });
  } catch (error) {
    console.error('YouTube captions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
