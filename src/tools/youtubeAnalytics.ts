import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { YouTubeService } from '../lib/youtube.js';

export const youtubeAnalyticsTool = createTool({
  id: 'youtube-analytics',
  description: 'Analyze YouTube channels and videos',
  inputSchema: z.object({
    action: z.enum(['channel', 'video', 'search', 'trending']),
    channelId: z.string().optional(),
    videoId: z.string().optional(),
    query: z.string().optional(),
    regionCode: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { action, channelId, videoId, query, regionCode } = context;
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        data: null,
        error: 'YouTube API key not configured',
      };
    }

    const youtube = new YouTubeService(apiKey);

    try {
      let data;
      
      switch (action) {
        case 'channel':
          if (!channelId) {
            throw new Error('Channel ID is required for channel analysis');
          }
          const channelInfo = await youtube.getChannelInfo(channelId);
          const channelVideos = await youtube.getChannelVideos(channelId);
          data = { channel: channelInfo, videos: channelVideos };
          break;
          
        case 'video':
          if (!videoId) {
            throw new Error('Video ID is required for video analysis');
          }
          const videoDetails = await youtube.getVideoDetails([videoId]);
          data = videoDetails[0];
          break;
          
        case 'search':
          if (!query) {
            throw new Error('Query is required for search');
          }
          data = await youtube.searchVideos(query);
          break;
          
        case 'trending':
          data = await youtube.getTrendingVideos(regionCode || 'JP');
          break;
          
        default:
          throw new Error('Invalid action');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});