import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { generateText } from 'ai';

class YouTubeService {
  youtube;
  constructor(apiKey) {
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey
    });
  }
  async getChannelInfo(channelId) {
    try {
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: [channelId]
      });
      return response.data.items?.[0] || null;
    } catch (error) {
      console.error("Error fetching channel info:", error);
      throw error;
    }
  }
  async getChannelVideos(channelId, maxResults = 50) {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        channelId,
        maxResults,
        order: "date",
        type: ["video"]
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      throw error;
    }
  }
  async getVideoDetails(videoIds) {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching video details:", error);
      throw error;
    }
  }
  async searchVideos(query, maxResults = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        q: query,
        maxResults,
        type: ["video"],
        order: "relevance"
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Error searching videos:", error);
      throw error;
    }
  }
  async getTrendingVideos(regionCode = "JP", categoryId) {
    try {
      const params = {
        part: ["snippet", "statistics"],
        chart: "mostPopular",
        regionCode,
        maxResults: 20
      };
      if (categoryId) {
        params.videoCategoryId = categoryId;
      }
      const response = await this.youtube.videos.list(params);
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      throw error;
    }
  }
}

const youtubeAnalyticsTool = createTool({
  id: "youtube-analytics",
  description: "Analyze YouTube channels and videos",
  inputSchema: z.object({
    action: z.enum(["channel", "video", "search", "trending"]),
    channelId: z.string().optional(),
    videoId: z.string().optional(),
    query: z.string().optional(),
    regionCode: z.string().optional()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { action, channelId, videoId, query, regionCode } = context;
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        data: null,
        error: "YouTube API key not configured"
      };
    }
    const youtube = new YouTubeService(apiKey);
    try {
      let data;
      switch (action) {
        case "channel":
          if (!channelId) {
            throw new Error("Channel ID is required for channel analysis");
          }
          const channelInfo = await youtube.getChannelInfo(channelId);
          const channelVideos = await youtube.getChannelVideos(channelId);
          data = { channel: channelInfo, videos: channelVideos };
          break;
        case "video":
          if (!videoId) {
            throw new Error("Video ID is required for video analysis");
          }
          const videoDetails = await youtube.getVideoDetails([videoId]);
          data = videoDetails[0];
          break;
        case "search":
          if (!query) {
            throw new Error("Query is required for search");
          }
          data = await youtube.searchVideos(query);
          break;
        case "trending":
          data = await youtube.getTrendingVideos(regionCode || "JP");
          break;
        default:
          throw new Error("Invalid action");
      }
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

const channelAnalysisAgent = new Agent({
  name: "Channel Analysis Agent",
  instructions: `You are a YouTube channel analysis expert. Your role is to:
  
  1. Analyze channel performance metrics (views, subscribers, engagement)
  2. Identify content patterns and successful video types
  3. Provide actionable recommendations for growth
  4. Compare against industry benchmarks
  5. Suggest content strategy improvements
  
  When analyzing a channel:
  - Look at recent video performance trends
  - Identify the most successful content types
  - Analyze upload frequency and consistency
  - Evaluate thumbnail and title effectiveness
  - Provide specific, actionable recommendations
  
  Always base your analysis on data and provide clear reasoning for your recommendations.`,
  model: openai("gpt-4-turbo"),
  tools: {
    youtubeAnalytics: youtubeAnalyticsTool
  }
});

const contentGeneratorTool = createTool({
  id: "content-generator",
  description: "Generate YouTube content ideas, titles, descriptions, and scripts",
  inputSchema: z.object({
    type: z.enum(["idea", "title", "description", "script", "tags"]),
    topic: z.string(),
    style: z.string().optional(),
    targetAudience: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    length: z.enum(["short", "medium", "long"]).optional()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content: z.string(),
    metadata: z.record(z.any()).optional()
  }),
  execute: async ({ context }) => {
    const { type, topic, style, targetAudience, keywords, length } = context;
    try {
      let prompt = "";
      switch (type) {
        case "idea":
          prompt = `Generate a creative YouTube video idea about "${topic}".
          ${targetAudience ? `Target audience: ${targetAudience}` : ""}
          ${style ? `Style: ${style}` : ""}
          Include:
          - Hook concept
          - Main content points
          - Call to action`;
          break;
        case "title":
          prompt = `Create an engaging YouTube video title about "${topic}".
          ${keywords ? `Include keywords: ${keywords.join(", ")}` : ""}
          Requirements:
          - Under 60 characters
          - Include emotional trigger
          - SEO optimized
          - Clickable but not clickbait`;
          break;
        case "description":
          prompt = `Write a YouTube video description about "${topic}".
          ${keywords ? `Include keywords: ${keywords.join(", ")}` : ""}
          Include:
          - Brief summary (2-3 sentences)
          - Key timestamps placeholder
          - Relevant links section
          - Social media links
          - SEO keywords naturally integrated`;
          break;
        case "script":
          const scriptLength = length === "short" ? "1-3 minutes" : length === "long" ? "10-15 minutes" : "5-7 minutes";
          prompt = `Write a YouTube video script about "${topic}".
          Length: ${scriptLength}
          ${targetAudience ? `Target audience: ${targetAudience}` : ""}
          ${style ? `Style: ${style}` : ""}
          Structure:
          - Hook (first 15 seconds)
          - Introduction
          - Main content with clear sections
          - Conclusion with CTA`;
          break;
        case "tags":
          prompt = `Generate 15-20 YouTube tags for a video about "${topic}".
          ${keywords ? `Primary keywords: ${keywords.join(", ")}` : ""}
          Include:
          - Broad tags
          - Specific tags
          - Long-tail keywords
          - Related topics`;
          break;
      }
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        prompt,
        temperature: 0.7
      });
      return {
        success: true,
        content: text,
        metadata: {
          type,
          topic,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
});

const videoIdeationAgent = new Agent({
  name: "Video Ideation Agent",
  instructions: `You are a creative YouTube content strategist specializing in video ideation. Your role is to:
  
  1. Generate unique and engaging video ideas
  2. Research trending topics in specific niches
  3. Create content calendars and series concepts
  4. Suggest viral-worthy hooks and angles
  5. Align ideas with channel goals and audience preferences
  
  When generating ideas:
  - Consider current trends and seasonal relevance
  - Ensure ideas match the channel's brand and style
  - Provide multiple variations and angles
  - Include potential collaboration opportunities
  - Suggest content series for sustained engagement
  
  Always prioritize quality, originality, and audience value in your suggestions.`,
  model: openai("gpt-4-turbo"),
  tools: {
    contentGenerator: contentGeneratorTool,
    youtubeAnalytics: youtubeAnalyticsTool
  }
});

const contentOptimizationAgent = new Agent({
  name: "Content Optimization Agent",
  instructions: `You are a YouTube SEO and content optimization specialist. Your role is to:
  
  1. Optimize video titles for click-through rate and SEO
  2. Create compelling descriptions with proper keyword placement
  3. Generate relevant tags for maximum discoverability
  4. Suggest thumbnail concepts for higher CTR
  5. Provide script optimization for retention
  
  When optimizing content:
  - Balance SEO with human appeal
  - Use data-driven keyword research
  - Create emotional hooks in titles
  - Structure descriptions for both viewers and algorithms
  - Suggest A/B testing strategies
  
  Always aim to improve both discoverability and viewer satisfaction.`,
  model: openai("gpt-4-turbo"),
  tools: {
    contentGenerator: contentGeneratorTool
  }
});

var mastra$1 = mastra;

export { channelAnalysisAgent, contentGeneratorTool, contentOptimizationAgent, mastra$1 as default, videoIdeationAgent, youtubeAnalyticsTool };
