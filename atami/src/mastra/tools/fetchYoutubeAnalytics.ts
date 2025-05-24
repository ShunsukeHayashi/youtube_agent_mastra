import { google } from 'googleapis';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getOAuthClient } from '../lib/google';

// Stub implementation - replace with real token retrieval logic
async function getTokenByUserId(userId: string): Promise<any | null> {
  const envKey = `YT_TOKEN_${userId.toUpperCase()}`;
  const token = process.env[envKey];
  return token ? JSON.parse(token) : null;
}

export const fetchYoutubeAnalyticsTool = createTool({
  id: 'getYouTubeAnalytics',
  description: '指定ユーザーのYouTubeチャンネルから動画KPIを取得する',
  inputSchema: z.object({
    userId: z.string(),
    period: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  outputSchema: z.array(
    z.object({
      videoId: z.string(),
      views: z.number(),
      avgDurationSec: z.number(),
      totalMinutes: z.number(),
    }),
  ),
  execute: async ({ context }) => {
    const tokens = await getTokenByUserId(context.userId);
    const oauth = getOAuthClient();
    if (!oauth) {
      throw new Error('OAuth client is not initialized');
    }
    if (tokens) {
      oauth.setCredentials(tokens);
    }
    const client = google.youtubeAnalytics({ version: 'v2', auth: oauth });

    const res = await client.reports.query({
      ids: 'channel==MINE',
      startDate: context.period.start,
      endDate: context.period.end,
      metrics: 'views,averageViewDuration,estimatedMinutesWatched',
      dimensions: 'video',
      maxResults: 10,
    });

    return (res.data.rows || []).map(row => ({
      videoId: row[0],
      views: Number(row[1]),
      avgDurationSec: Number(row[2]),
      totalMinutes: Number(row[3]),
    }));
  },
});
