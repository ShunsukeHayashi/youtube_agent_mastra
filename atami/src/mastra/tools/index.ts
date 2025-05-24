import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  型定義                                                             */
/* ------------------------------------------------------------------ */
interface YouTubeSearchResponse {
  items: {
    id: { kind: string; videoId?: string; channelId?: string; playlistId?: string };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
      publishTime: string;
    };
  }[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

interface Persona {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  channelUseCase: string;
  keywordRelevance: string;
}

interface ChannelConcept {
  title: string;
  description: string;
  targetKeywords: string[];
  targetPersonas: string[];
  contentThemes: string[];
  uniqueSellingPoint: string;
}

/* ------------------------------------------------------------------ */
/*  YouTube 検索ツール                                                 */
/* ------------------------------------------------------------------ */
export const youtubeSearchTool = createTool({
  id: 'youtube-search',
  description: 'Search for YouTube videos by keyword',
  inputSchema: z.object({
    query: z.string().describe('Search query for YouTube videos'),
    maxResults: z.number().min(1).max(50).default(5).describe('Number of results to return (max 50)'),
    type: z.enum(['video', 'channel', 'playlist']).default('video').describe('Type of search results to return'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        channelTitle: z.string(),
        publishedAt: z.string(),
        thumbnailUrl: z.string(),
        url: z.string(),
      })
    ),
    totalResults: z.number(),
    nextPageToken: z.string().optional(),
  }),
  execute: async ({ context }) => {
    return await searchYoutube(context.query, context.maxResults, context.type);
  },
});

/* ------------------------------------------------------------------ */
/*  既存ツールの再エクスポート                                          */
/* ------------------------------------------------------------------ */
export { youtubeTitleGeneratorTool } from './titleGenerator';
export {
  getChannelAnalytics,
  getVideoAnalytics,
  getAudienceGeographics,
} from './youtube-analytics';
export { youtubeInputCollectionTool } from './inputCollection';
export { youtubeChannelConceptTool } from './channelConcept';
export { youtubeThumbnailTitleGeneratorTool } from './thumbnailTitleGenerator';
export { youtubeVideoPlanningTool } from './videoPlanningSeo';
export { keywordResearchTool } from './keywordResearch';
export { youtubeVideoScriptGeneratorTool } from './videoScriptGenerator';      // ← HEAD 側
export { fetchYoutubeAnalyticsTool } from './fetchYoutubeAnalytics';           // ← remote 側

/* ------------------------------------------------------------------ */
/*  チャンネルプランナー・ツール                                       */
/* ------------------------------------------------------------------ */
export const youtubeChannelPlannerTool = createTool({
  id: 'youtube-channel-planner',
  description:
    'Plan a YouTube channel concept based on keyword research and persona analysis',
  inputSchema: z.object({
    productDescription: z.string().describe('Description of the product or service being promoted'),
    websiteUrl: z.string().optional().describe('URL of the product/service website'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel'),
    industryCategory: z.string().optional().describe('Industry or business category'),
  }),
  outputSchema: z.object({
    keywordResearch: z.array(
      z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        competition: z.string(),
        relevance: z.number(),
        rank: z.number(),
      })
    ),
    topKeywords: z.array(z.string()),
    personaAnalysis: z.array(
      z.object({
        name: z.string(),
        age: z.string(),
        gender: z.string(),
        occupation: z.string(),
        interests: z.array(z.string()),
        painPoints: z.array(z.string()),
        goals: z.array(z.string()),
        channelUseCase: z.string(),
        keywordRelevance: z.string(),
      })
    ),
    selectedPersonas: z.array(z.string()),
    futureGoals: z.array(z.string()),
    channelConcepts: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        targetKeywords: z.array(z.string()),
        targetPersonas: z.array(z.string()),
        contentThemes: z.array(z.string()),
        uniqueSellingPoint: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    return await planYouTubeChannel(
      context.productDescription,
      context.websiteUrl,
      context.targetAudience,
      context.businessGoals,
      context.industryCategory
    );
  },
});

/* ------------------------------------------------------------------ */
/*  内部関数：YouTube 検索 API 呼び出し                                */
/* ------------------------------------------------------------------ */
const searchYoutube = async (query: string, maxResults = 5, type = 'video') => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('Set YOUTUBE_API_KEY env var.');

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('q', query);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('key', apiKey);
  url.searchParams.append('type', type);

  const res = await fetch(url.toString());
  if (!res.ok) {
    let msg = `YouTube API error ${res.status}`;
    try {
      msg += ` - ${JSON.stringify(await res.json())}`;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as YouTubeSearchResponse;
  return {
    results: (data.items ?? []).map((item) => {
      const id = item.id.videoId || item.id.channelId || item.id.playlistId || '';
      const url =
        item.id.videoId
          ? `https://www.youtube.com/watch?v=${item.id.videoId}`
          : item.id.channelId
          ? `https://www.youtube.com/channel/${item.id.channelId}`
          : `https://www.youtube.com/playlist?list=${item.id.playlistId}`;

      return {
        id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        url,
      };
    }),
    totalResults: data.pageInfo.totalResults,
    nextPageToken: data.nextPageToken,
  };
};

/* ------------------------------------------------------------------ */
/*  内部関数：チャンネルプランニング（ダミー実装）                     */
/* ------------------------------------------------------------------ */
const planYouTubeChannel = async (
  productDescription: string,
  websiteUrl?: string,
  targetAudience?: string,
  businessGoals?: string,
  industryCategory?: string
) => {
  // TODO: 実際の外部 API 連携に置き換える
  return {
    keywordResearch: [
      { keyword: 'youtube channel strategy', searchVolume: 5400, competition: 'Medium', relevance: 9.5, rank: 1 },
      { keyword: 'content creation',         searchVolume: 12000, competition: 'High',   relevance: 8.7, rank: 2 },
      { keyword: 'video marketing',          searchVolume: 8200,  competition: 'Medium', relevance: 8.2, rank: 3 },
    ],
    topKeywords: ['youtube channel strategy', 'content creation', 'video marketing'],
    personaAnalysis: [
      {
        name: 'Alex',
        age: '25-34',
        gender: 'Male',
        occupation: 'Content Creator',
        interests: ['Video production', 'Social media marketing', 'Audience growth'],
        painPoints: ['Algorithm changes', 'Content saturation', 'Time management'],
        goals: ['Grow subscriber base', 'Increase engagement', 'Monetize channel'],
        channelUseCase: 'Looking for strategic guidance to grow YouTube presence',
        keywordRelevance: 'youtube channel strategy',
      },
      {
        name: 'Jordan',
        age: '35-44',
        gender: 'Female',
        occupation: 'Marketing Manager',
        interests: ['Brand development', 'Content marketing', 'Analytics'],
        painPoints: ['ROI measurement', 'Resource allocation', 'Content quality'],
        goals: ['Increase brand awareness', 'Generate leads', 'Build community'],
        channelUseCase: 'Seeking to establish company’s YouTube presence',
        keywordRelevance: 'content creation',
      },
    ],
    selectedPersonas: ['Alex', 'Jordan'],
    futureGoals: [
      'Establish a consistent posting schedule',
      'Develop a unique channel aesthetic',
      'Create content series that drive subscriber growth',
      'Optimize videos for search and discovery',
    ],
    channelConcepts: [
      {
        title: 'The Strategy Lab',
        description: 'Data-driven YouTube growth strategies with actionable tips and case studies',
        targetKeywords: ['youtube strategy', 'channel growth', 'content creation'],
        targetPersonas: ['Alex', 'Jordan'],
        contentThemes: ['Algorithm analysis', 'Trend spotting', 'Channel audits', 'Growth case studies'],
        uniqueSellingPoint: 'Evidence-based strategies backed by real channel data',
      },
      {
        title: 'Content Creator HQ',
        description: 'The ultimate resource for creators looking to build sustainable YouTube channels',
        targetKeywords: ['content creation', 'youtube tips', 'video marketing'],
        targetPersonas: ['Alex', 'Jordan'],
        contentThemes: ['Content planning', 'Video production', 'Audience building', 'Monetization'],
        uniqueSellingPoint: 'Comprehensive system for building a YouTube business from scratch',
      },
    ],
  };
};
