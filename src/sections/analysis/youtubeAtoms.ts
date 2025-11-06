import { atom } from "jotai";

export interface YTFilters {
  duration: 'any' | 'short' | 'medium' | 'long';
  lang: string;
  sort: 'relevance' | 'viewCount' | 'date';
}

export interface YTVideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount?: string;
  description?: string;
  thumbnails: {
    default: string;
    medium?: string;
    high?: string;
  };
}

export const ytPanelOpenAtom = atom(true);
export const ytFiltersAtom = atom<YTFilters>({
  duration: 'any',
  lang: 'en',
  sort: 'relevance',
});
export const ytCacheAtom = atom<Record<string, YTVideoResult[]>>({});
