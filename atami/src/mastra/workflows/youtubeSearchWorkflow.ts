import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeSearchTool } from '../tools';

// Step1: YouTube Search API 呼び出し
const searchYoutubeStep = createStep({
  id: 'youtube-search-api',
  description: 'YouTube Search API を使って動画を検索する',
  inputSchema: z.object({
    search_term: z.string().describe('検索したいYouTubeキーワード'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      channelTitle: z.string(),
      publishedAt: z.string(),
      thumbnailUrl: z.string(),
    })),
  }),
  execute: async ({ input, runtimeContext }) => {
    const res = await youtubeSearchTool.execute({
      runtimeContext,
      context: {
        query: input.search_term,
        maxResults: 10,
        type: 'video',
      },
    });
    return { results: res.results };
  },
});

// Step2: 検索結果から必要な情報を抽出し、再生回数を取得
const extractVideoInfoStep = createStep({
  id: 'extract-video-info',
  description: '検索結果から動画情報を整形し、再生回数を付与する',
  inputSchema: z.object({}),
  outputSchema: z.object({
    videos: z.array(z.object({
      videoId: z.string(),
      title: z.string(),
      description: z.string(),
      channelTitle: z.string(),
      viewCount: z.number().optional(),
    })),
  }),
  execute: async ({ context }) => {
    const searchResults = context?.getStepResult<typeof searchYoutubeStep>(searchYoutubeStep);
    if (!searchResults) {
      throw new Error('Search results not found');
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const ids = searchResults.results.map((v) => v.id).join(',');
    let viewMap: Record<string, number> = {};
    if (apiKey && ids) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.items) {
          json.items.forEach((item: any) => {
            viewMap[item.id] = parseInt(item.statistics?.viewCount ?? '0', 10);
          });
        }
      } catch (error) {
        console.error('Failed to fetch video statistics:', error);
      }
    }

    const videos = searchResults.results.map((item) => ({
      videoId: item.id,
      title: item.title,
      description: item.description,
      channelTitle: item.channelTitle,
      viewCount: viewMap[item.id],
    }));

    return { videos };
  },
});

// Workflow definition
const youtubeSearchWorkflow = createWorkflow({
  id: 'youtube-search-workflow',
  description: 'キーワードからYouTube動画を検索し基本情報を返すワークフロー',
  inputSchema: z.object({
    search_term: z.string().describe('検索したいYouTubeキーワード'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      videos: z.array(z.object({
        videoId: z.string(),
        title: z.string(),
        description: z.string(),
        channelTitle: z.string(),
        viewCount: z.number().optional(),
      })),
    }).optional(),
  }),
})
  .then(searchYoutubeStep)
  .then(extractVideoInfoStep);

youtubeSearchWorkflow.commit();

export { youtubeSearchWorkflow };
