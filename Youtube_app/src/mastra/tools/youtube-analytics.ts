import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getYoutubeAnalytics } from '../lib/google.js';

/**
 * YouTube Analytics API v2 でチャンネル／動画 KPI を取得
 */
export const getChannelAnalytics = createTool({
  id: 'getChannelAnalytics',
  description: '視聴回数・視聴維持率・CTR などの KPI を取得し JSON で返す',
  inputSchema: z.object({
    channelId: z.string().describe('取得対象のチャンネル ID'),
    startDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 30日前')
      .default(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      ),
    endDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 今日')
      .default(new Date().toISOString().slice(0, 10)),
    metrics: z
      .array(z.string())
      .default(['views', 'averageViewDuration', 'estimatedMinutesWatched']),
    dimensions: z.string().optional().default('day'),
    videoId: z
      .string()
      .optional()
      .describe('特定動画の KPI を取る場合のみ指定'),
  }),
  outputSchema: z.object({
    rows: z.array(
      z.record(z.string(), z.union([z.string(), z.number()])),
    ).describe('取得した KPI 行列'),
    summary: z.object({
      totalViews: z.number().optional(),
      avgViewDuration: z.number().optional(),
      totalWatchTime: z.number().optional(),
      avgCtr: z.number().optional(),
    }).optional().describe('集計データのサマリー'),
    period: z.object({
      startDate: z.string(),
      endDate: z.string(),
      days: z.number(),
    }).describe('データ取得期間'),
  }),
  execute: async ({ context }) => {
    const { channelId, startDate, endDate, metrics, dimensions, videoId } = context;

    // Get actual or mock YouTube Analytics instance
    const youtubeAnalytics = getYoutubeAnalytics();

    try {
      const res = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: metrics.join(','), // 例: views,estimatedMinutesWatched
        dimensions,
        filters: videoId ? `video==${videoId}` : undefined,
      });

      // Prepare header mapping
      const headers = res.data.columnHeaders?.map((h) => h.name) ?? [];
      
      // Transform rows to objects with named properties
      const rows = (res.data.rows ?? []).map((r) =>
        Object.fromEntries(r.map((v, i) => [headers[i], v])),
      );

      // Calculate summary data
      const summary = calculateSummary(rows, headers);

      // Calculate period information
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const days = Math.ceil((endTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));

      return { 
        rows, 
        summary,
        period: {
          startDate,
          endDate,
          days,
        }
      };
    } catch (error) {
      console.error('Error fetching YouTube Analytics data:', error);
      throw new Error(`Failed to fetch YouTube Analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Calculate summary metrics from rows data
 */
function calculateSummary(
  rows: Record<string, string | number>[],
  headers: string[]
): {
  totalViews?: number;
  avgViewDuration?: number;
  totalWatchTime?: number;
  avgCtr?: number;
} {
  // If no data, return empty summary
  if (rows.length === 0) {
    return {};
  }

  // Check which metrics are available
  const hasViews = headers.includes('views');
  const hasViewDuration = headers.includes('averageViewDuration');
  const hasWatchTime = headers.includes('estimatedMinutesWatched');
  const hasCtr = headers.includes('cardClickRate');

  // Calculate totals and averages
  let totalViews = 0;
  let weightedViewDuration = 0;
  let totalWatchTime = 0;
  let weightedCtr = 0;

  rows.forEach(row => {
    const views = Number(row.views || 0);
    
    if (hasViews) {
      totalViews += views;
    }
    
    if (hasViewDuration) {
      const viewDuration = Number(row.averageViewDuration || 0);
      weightedViewDuration += views * viewDuration;
    }
    
    if (hasWatchTime) {
      totalWatchTime += Number(row.estimatedMinutesWatched || 0);
    }
    
    if (hasCtr) {
      const ctr = Number(row.cardClickRate || 0);
      weightedCtr += views * ctr;
    }
  });

  // Calculate averages weighted by view count
  const avgViewDuration = hasViews && hasViewDuration && totalViews > 0 
    ? weightedViewDuration / totalViews 
    : undefined;
    
  const avgCtr = hasViews && hasCtr && totalViews > 0
    ? weightedCtr / totalViews
    : undefined;

  return {
    ...(hasViews ? { totalViews } : {}),
    ...(avgViewDuration !== undefined ? { avgViewDuration } : {}),
    ...(hasWatchTime ? { totalWatchTime } : {}),
    ...(avgCtr !== undefined ? { avgCtr } : {}),
  };
}

/**
 * 特定動画の詳細KPIを取得するためのツール
 */
export const getVideoAnalytics = createTool({
  id: 'getVideoAnalytics',
  description: '特定の動画に関する詳細なKPIを取得する',
  inputSchema: z.object({
    channelId: z.string().describe('チャンネルID'),
    videoId: z.string().describe('分析対象の動画ID'),
    startDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 動画公開から30日')
      .optional(),
    endDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 今日')
      .default(new Date().toISOString().slice(0, 10)),
    metrics: z
      .array(z.string())
      .default([
        'views',
        'averageViewDuration',
        'estimatedMinutesWatched',
        'averageViewPercentage',
        'cardClickRate',
        'cardTeaserClickRate',
        'subscribersGained'
      ]),
    dimensions: z.string().optional().default('day'),
  }),
  outputSchema: z.object({
    videoId: z.string(),
    rows: z.array(
      z.record(z.string(), z.union([z.string(), z.number()])),
    ),
    summary: z.object({
      totalViews: z.number().optional(),
      avgViewDuration: z.number().optional(),
      totalWatchTime: z.number().optional(),
      retentionRate: z.number().optional(),
      ctr: z.number().optional(),
      subscribersGained: z.number().optional(),
    }).optional(),
    period: z.object({
      startDate: z.string(),
      endDate: z.string(),
      days: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { channelId, videoId, startDate, endDate, metrics, dimensions } = context;
    
    // Determine start date if not provided (defaults to 30 days before end date)
    const effectiveStartDate = startDate || 
      new Date(new Date(endDate).getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    
    // Get actual or mock YouTube Analytics instance
    const youtubeAnalytics = getYoutubeAnalytics();

    try {
      const res = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: effectiveStartDate,
        endDate,
        metrics: metrics.join(','),
        dimensions,
        filters: `video==${videoId}`,
      });

      // Prepare header mapping
      const headers = res.data.columnHeaders?.map((h) => h.name) ?? [];
      
      // Transform rows to objects with named properties
      const rows = (res.data.rows ?? []).map((r) =>
        Object.fromEntries(r.map((v, i) => [headers[i], v])),
      );

      // Calculate summary data with additional video-specific metrics
      const summary = {
        ...calculateSummary(rows, headers),
        retentionRate: headers.includes('averageViewPercentage') 
          ? rows.reduce((sum, row) => sum + Number(row.averageViewPercentage || 0), 0) / rows.length
          : undefined,
        subscribersGained: headers.includes('subscribersGained')
          ? rows.reduce((sum, row) => sum + Number(row.subscribersGained || 0), 0)
          : undefined,
      };

      // Calculate period information
      const startTimestamp = new Date(effectiveStartDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const days = Math.ceil((endTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));

      return { 
        videoId,
        rows, 
        summary,
        period: {
          startDate: effectiveStartDate,
          endDate,
          days,
        }
      };
    } catch (error) {
      console.error('Error fetching video analytics data:', error);
      throw new Error(`Failed to fetch video analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * チャンネル視聴者の地域・デモグラフィック情報を取得するツール
 */
export const getAudienceGeographics = createTool({
  id: 'getAudienceGeographics',
  description: 'チャンネル視聴者の地域・デモグラフィック情報を取得する',
  inputSchema: z.object({
    channelId: z.string().describe('チャンネルID'),
    startDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 30日前')
      .default(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      ),
    endDate: z
      .string()
      .describe('YYYY-MM-DD 形式。デフォルト: 今日')
      .default(new Date().toISOString().slice(0, 10)),
    metrics: z
      .array(z.string())
      .default(['viewerPercentage']),
    dimensions: z.enum(['country', 'gender', 'ageGroup']).default('country'),
    videoId: z
      .string()
      .optional()
      .describe('特定動画の視聴者情報を取る場合のみ指定'),
  }),
  outputSchema: z.object({
    dimensionType: z.string(),
    rows: z.array(
      z.object({
        dimension: z.string(),
        percentage: z.number(),
      })
    ),
    period: z.object({
      startDate: z.string(),
      endDate: z.string(),
      days: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { channelId, startDate, endDate, metrics, dimensions, videoId } = context;

    // Get actual or mock YouTube Analytics instance
    const youtubeAnalytics = getYoutubeAnalytics();

    try {
      const res = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: metrics.join(','),
        dimensions,
        filters: videoId ? `video==${videoId}` : undefined,
        sort: '-viewerPercentage',
      });

      // Prepare header mapping
      const headers = res.data.columnHeaders?.map((h) => h.name) ?? [];
      
      // Transform rows to standardized format
      const transformedRows = (res.data.rows ?? []).map((r) => ({
        dimension: String(r[0]), // First column is the dimension (country, gender, ageGroup)
        percentage: Number(r[1]), // Second column is typically viewerPercentage
      }));

      // Calculate period information
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const days = Math.ceil((endTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));

      return { 
        dimensionType: dimensions,
        rows: transformedRows,
        period: {
          startDate,
          endDate,
          days,
        }
      };
    } catch (error) {
      console.error('Error fetching audience demographics:', error);
      throw new Error(`Failed to fetch audience demographics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});