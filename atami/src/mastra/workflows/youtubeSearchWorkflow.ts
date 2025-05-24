import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeSearchTool } from '../tools';

/**
 * Step 1 ────────────────────────────────────────────────────────────
 * YouTube 検索 API を呼び出し、検索結果をそのまま返す。
 */
const searchYoutubeStep = createStep({
  id: 'youtube-search-api',
  description: 'YouTube Search API を使って動画を検索する',
  inputSchema: z.object({
    /** 検索したいキーワード */
    search_term: z.string(),
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
      })
    ),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const input = context?.getStepResult('trigger');
    if (!input) throw new Error('Input data not found');
    
    const { results } = await youtubeSearchTool.execute({
      runtimeContext: params,
      context: {
        query: input.search_term,
        maxResults: 10,
        type: 'video',
      },
    });

    return { results };
  },
});

/**
 * Step 2 ────────────────────────────────────────────────────────────
 * Step1 の結果に対し、YouTube Data API(v3) statistics エンドポイントを呼び
 * viewCount を付与した新しい配列を生成する。
 */
const extractVideoInfoStep = createStep({
  id: 'extract-video-info',
  description: '検索結果を整形し再生回数を付与する',
  inputSchema: searchYoutubeStep.outputSchema,
  outputSchema: z.object({
    videos: z.array(
      z.object({
        videoId: z.string(),
        title: z.string(),
        description: z.string(),
        channelTitle: z.string(),
        viewCount: z.number().optional(),
      })
    ),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const searchResult = context?.getStepResult('youtube-search-api');
    if (!searchResult) throw new Error('Search results not found');
    
    // 検索結果から動画 ID を抽出
    const ids = searchResult.results.map((v: any) => v.id).join(',');
    const apiKey = process.env.YOUTUBE_API_KEY;

    // id → viewCount のマッピングを作成
    const viewMap: Record<string, number> = {};

    if (apiKey && ids) {
      try {
        const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`;
        const res = await fetch(endpoint);
        const json: any = await res.json();

        json.items?.forEach((item: any) => {
          viewMap[item.id] = Number(item.statistics?.viewCount ?? 0);
        });
      } catch (error) {
        console.error('[extractVideoInfoStep] failed to fetch statistics', error);
      }
    }

    // 最終整形
    const videos = searchResult.results.map((v: any) => ({
      videoId: v.id,
      title: v.title,
      description: v.description,
      channelTitle: v.channelTitle,
      viewCount: viewMap[v.id],
    }));

    return { videos };
  },
});

/**
 * Workflow ──────────────────────────────────────────────────────────
 */
export const youtubeSearchWorkflow = createWorkflow({
  id: 'youtube-search-workflow',
  description: 'キーワードから YouTube 動画を検索し基本情報を返すワークフロー',
  inputSchema: searchYoutubeStep.inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z
      .object({
        videos: extractVideoInfoStep.outputSchema.shape.videos,
      })
      .optional(),
  }),
})
  .then(searchYoutubeStep)
  .then(extractVideoInfoStep);

// 最後に commit してエクスポート
youtubeSearchWorkflow.commit();
