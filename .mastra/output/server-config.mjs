import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { generateText } from 'ai';
import { Workflow } from '@mastra/core/workflows';

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
  name: "YouTube Analytics Tool",
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
  execute: async ({ action, channelId, videoId, query, regionCode }) => {
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
  id: "channel-analysis",
  name: "Channel Analysis Agent",
  description: "Analyzes YouTube channels for performance insights and recommendations",
  model: openai("gpt-4-turbo"),
  tools: {
    youtubeAnalytics: youtubeAnalyticsTool
  },
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
  temperature: 0.3
});

const contentGeneratorTool = createTool({
  id: "content-generator",
  name: "Content Generator Tool",
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
  execute: async ({ type, topic, style, targetAudience, keywords, length }) => {
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
  id: "video-ideation",
  name: "Video Ideation Agent",
  description: "Generates creative video ideas based on trends and channel analysis",
  model: openai("gpt-4-turbo"),
  tools: {
    contentGenerator: contentGeneratorTool,
    youtubeAnalytics: youtubeAnalyticsTool
  },
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
  temperature: 0.8
});

const contentOptimizationAgent = new Agent({
  id: "content-optimization",
  name: "Content Optimization Agent",
  description: "Optimizes YouTube content for discoverability and engagement",
  model: openai("gpt-4-turbo"),
  tools: {
    contentGenerator: contentGeneratorTool
  },
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
  temperature: 0.5
});

const channelAnalysisWorkflow = new Workflow({
  id: "channel-analysis-workflow",
  name: "Channel Analysis Workflow",
  description: "Comprehensive YouTube channel analysis and recommendations",
  inputSchema: z.object({
    channelId: z.string(),
    analysisDepth: z.enum(["basic", "detailed", "comprehensive"]).default("detailed"),
    competitorChannels: z.array(z.string()).optional()
  }),
  outputSchema: z.object({
    channelMetrics: z.object({
      subscribers: z.number(),
      totalViews: z.number(),
      videoCount: z.number(),
      averageViews: z.number()
    }),
    performanceAnalysis: z.string(),
    recommendations: z.array(z.string()),
    competitiveInsights: z.string().optional()
  }),
  steps: [
    {
      id: "fetch-channel-data",
      type: "agent",
      agent: channelAnalysisAgent,
      prompt: async ({ input }) => ({
        messages: [{
          role: "user",
          content: `Analyze the YouTube channel with ID: ${input.channelId}. 
          Analysis depth: ${input.analysisDepth}.
          First, fetch the channel data and recent videos.`
        }]
      })
    },
    {
      id: "analyze-performance",
      type: "agent",
      agent: channelAnalysisAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Based on the channel data, provide a ${input.analysisDepth} performance analysis.
          Focus on:
          - Content performance trends
          - Engagement metrics
          - Upload consistency
          - Most successful video types`
        }]
      })
    },
    {
      id: "generate-recommendations",
      type: "agent",
      agent: channelAnalysisAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Based on the analysis, provide specific recommendations for channel growth.
          Include:
          - Content strategy improvements
          - SEO optimization tips
          - Engagement tactics
          - Upload schedule suggestions`
        }]
      })
    }
  ],
  output: async ({ steps }) => {
    const analysis = steps["analyze-performance"].output;
    return {
      channelMetrics: {
        subscribers: 0,
        totalViews: 0,
        videoCount: 0,
        averageViews: 0
      },
      performanceAnalysis: analysis,
      recommendations: [],
      competitiveInsights: void 0
    };
  }
});

const videoIdeationWorkflow = new Workflow({
  id: "video-ideation-workflow",
  name: "Video Ideation Workflow",
  description: "Generate creative video ideas based on trends and channel niche",
  inputSchema: z.object({
    topic: z.string(),
    channelNiche: z.string(),
    targetAudience: z.string(),
    numberOfIdeas: z.number().min(1).max(10).default(5),
    includeTraends: z.boolean().default(true)
  }),
  outputSchema: z.object({
    ideas: z.array(z.object({
      title: z.string(),
      concept: z.string(),
      hook: z.string(),
      estimatedDuration: z.string(),
      targetKeywords: z.array(z.string())
    })),
    trendingTopics: z.array(z.string()).optional(),
    contentCalendar: z.string().optional()
  }),
  steps: [
    {
      id: "research-trends",
      type: "agent",
      agent: videoIdeationAgent,
      prompt: async ({ input }) => ({
        messages: [{
          role: "user",
          content: `Research trending topics in the ${input.channelNiche} niche.
          Target audience: ${input.targetAudience}.
          Find current trends and viral content ideas related to ${input.topic}.`
        }]
      }),
      condition: ({ input }) => input.includeTraends
    },
    {
      id: "generate-ideas",
      type: "agent",
      agent: videoIdeationAgent,
      prompt: async ({ input, steps }) => {
        const trendData = steps["research-trends"]?.output || "";
        return {
          messages: [{
            role: "user",
            content: `Generate ${input.numberOfIdeas} creative video ideas about ${input.topic}.
            Channel niche: ${input.channelNiche}
            Target audience: ${input.targetAudience}
            ${trendData ? `Consider these trends: ${trendData}` : ""}
            
            For each idea, provide:
            - Catchy title
            - Concept description
            - Hook for first 15 seconds
            - Estimated video duration
            - Target keywords`
          }]
        };
      }
    },
    {
      id: "create-content-calendar",
      type: "agent",
      agent: videoIdeationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Based on the generated ideas, create a 30-day content calendar.
          Include:
          - Optimal posting schedule
          - Content variety balance
          - Series or theme suggestions
          - Special date tie-ins`
        }]
      })
    }
  ],
  output: async ({ steps }) => {
    return {
      ideas: [],
      trendingTopics: [],
      contentCalendar: steps["create-content-calendar"]?.output
    };
  }
});

const contentOptimizationWorkflow = new Workflow({
  id: "content-optimization-workflow",
  name: "Content Optimization Workflow",
  description: "Optimize YouTube content for maximum reach and engagement",
  inputSchema: z.object({
    videoTopic: z.string(),
    currentTitle: z.string().optional(),
    currentDescription: z.string().optional(),
    targetKeywords: z.array(z.string()),
    competitorVideos: z.array(z.string()).optional()
  }),
  outputSchema: z.object({
    optimizedTitle: z.object({
      primary: z.string(),
      alternatives: z.array(z.string())
    }),
    optimizedDescription: z.string(),
    tags: z.array(z.string()),
    thumbnailConcepts: z.array(z.string()),
    seoScore: z.number()
  }),
  steps: [
    {
      id: "analyze-keywords",
      type: "agent",
      agent: contentOptimizationAgent,
      prompt: async ({ input }) => ({
        messages: [{
          role: "user",
          content: `Analyze these keywords for YouTube SEO: ${input.targetKeywords.join(", ")}.
          Topic: ${input.videoTopic}
          ${input.currentTitle ? `Current title: ${input.currentTitle}` : ""}
          
          Provide:
          - Keyword competitiveness
          - Search volume insights
          - Related keywords to include`
        }]
      })
    },
    {
      id: "optimize-title",
      type: "agent",
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Create optimized YouTube titles for: ${input.videoTopic}
          Keywords: ${input.targetKeywords.join(", ")}
          ${input.currentTitle ? `Improve upon: ${input.currentTitle}` : ""}
          
          Provide:
          - One primary title (max 60 chars)
          - 3-5 alternative titles
          - Explanation of optimization tactics used`
        }]
      })
    },
    {
      id: "optimize-description",
      type: "agent",
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Write an optimized YouTube description for: ${input.videoTopic}
          Keywords: ${input.targetKeywords.join(", ")}
          ${input.currentDescription ? `Improve upon: ${input.currentDescription}` : ""}
          
          Include:
          - Compelling first 125 characters
          - Natural keyword integration
          - Timestamp placeholders
          - Call-to-action
          - Relevant links section`
        }]
      })
    },
    {
      id: "generate-tags",
      type: "agent",
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Generate optimized YouTube tags for: ${input.videoTopic}
          Primary keywords: ${input.targetKeywords.join(", ")}
          
          Provide 20-30 tags including:
          - Exact match keywords
          - Broad match variations
          - Long-tail keywords
          - Related topics`
        }]
      })
    },
    {
      id: "thumbnail-concepts",
      type: "agent",
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: "user",
          content: `Suggest 3-5 thumbnail concepts for: ${input.videoTopic}
          
          For each concept include:
          - Visual elements
          - Text overlay suggestions
          - Color psychology reasoning
          - CTR optimization tactics`
        }]
      })
    }
  ],
  output: async ({ steps }) => {
    return {
      optimizedTitle: {
        primary: "",
        alternatives: []
      },
      optimizedDescription: "",
      tags: [],
      thumbnailConcepts: [],
      seoScore: 0
    };
  }
});

var mastra$1 = mastra;
const server = {};

export { channelAnalysisAgent, channelAnalysisWorkflow, contentGeneratorTool, contentOptimizationAgent, contentOptimizationWorkflow, mastra$1 as default, server, videoIdeationAgent, videoIdeationWorkflow, youtubeAnalyticsTool };
//# sourceMappingURL=server-config.mjs.map
