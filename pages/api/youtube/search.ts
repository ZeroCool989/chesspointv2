import type { NextApiRequest, NextApiResponse } from 'next';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount?: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

interface YouTubeVideosResponse {
  items: YouTubeVideoDetails[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, duration = 'any', order = 'relevance', lang = 'en', pageToken } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const apiKey = process.env.YT_API_KEY;
  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE' || apiKey === 'test') {
    return res.status(200).json({ 
      items: [], 
      nextPageToken: null,
      message: 'YouTube API key not configured. Please add YT_API_KEY to .env.local'
    });
  }

  try {
    // Build search params
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: q,
      type: 'video',
      maxResults: '12',
      order: order as string,
      relevanceLanguage: lang as string,
      key: apiKey,
    });

    // Add duration filter
    if (duration !== 'any') {
      searchParams.append('videoDuration', duration as string);
    }

    // Add page token for pagination
    if (pageToken && typeof pageToken === 'string') {
      searchParams.append('pageToken', pageToken);
    }

    // Search for videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube API error:', errorData);

      // Handle quota errors gracefully
      if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
        return res.status(503).json({ error: 'YouTube API quota exceeded. Please try again later.' });
      }

      return res.status(searchResponse.status).json({ error: 'YouTube API request failed' });
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(200).json({ items: [], nextPageToken: null });
    }

    // Get video IDs for details request
    const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

    // Fetch video details (duration, views)
    const detailsParams = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds,
      key: apiKey,
    });

    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`
    );

    if (!detailsResponse.ok) {
      console.error('YouTube details API error');
      // Return search results without details if this fails
      const items = searchData.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: '',
        thumbnails: {
          default: item.snippet.thumbnails.default.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url,
        },
      }));

      return res.status(200).json({
        items,
        nextPageToken: searchData.nextPageToken || null,
      });
    }

    const detailsData: YouTubeVideosResponse = await detailsResponse.json();

    // Merge search results with details
    const detailsMap = new Map(
      detailsData.items.map((item) => [item.id, item])
    );

    const items = searchData.items.map((item) => {
      const details = detailsMap.get(item.id.videoId);

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: details?.contentDetails.duration || '',
        viewCount: details?.statistics.viewCount,
        thumbnails: {
          default: item.snippet.thumbnails.default.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url,
        },
      };
    });

    // Set cache headers (5 minutes)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      items,
      nextPageToken: searchData.nextPageToken || null,
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
