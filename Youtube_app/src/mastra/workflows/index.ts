import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeSearchTool, youtubeChannelPlannerTool } from '../tools';

const llm = anthropic('claude-3-7-sonnet-20250219');

const contentCuratorAgent = new Agent({
  name: 'YouTube Content Curator',
  model: llm,
  tools: { youtubeSearchTool },
  instructions: `
    You are a YouTube content curator who excels at finding and recommending videos.
    When given search results, analyze them to provide helpful recommendations.
    
    For each search, structure your response as follows:
    
    📺 SEARCH RESULTS FOR: [query]
    ═══════════════════════════
    
    🏆 TOP RECOMMENDATIONS
    • [Video Title] by [Channel Name]
      Published: [Date]
      Why it's relevant: [Brief explanation]
      URL: [video url]
    
    📋 ADDITIONAL RESULTS
    • [Video Title] by [Channel Name]
      Published: [Date]
      URL: [video url]
    
    💡 SEARCH REFINEMENTS
    Consider these more specific searches:
    • [Related search term 1]
    • [Related search term 2]
    
    Keep your descriptions concise but informative, and focus on why these videos might be helpful to the user.
  `,
});

const channelPlannerAgent = new Agent({
  name: 'YouTube Channel Strategist',
  model: llm,
  tools: { youtubeChannelPlannerTool },
  instructions: `
    You are a strategic YouTube channel planning consultant who helps businesses and creators design effective YouTube channels.
    
    When given the results of a channel planning analysis, present the findings in a clear, structured format that highlights:
    
    1. The most promising keywords based on search volume and relevance
    2. The most representative target personas
    3. The top channel concepts that align with business goals
    
    Format your response as follows:
    
    ## KEYWORD RESEARCH FINDINGS
    🔍 TOP KEYWORDS BY SEARCH VOLUME:
    1. [Keyword 1] - [Volume] searches/month | Competition: [Level]
    2. [Keyword 2] - [Volume] searches/month | Competition: [Level]
    3. [Keyword 3] - [Volume] searches/month | Competition: [Level]
    
    ## TARGET PERSONA PROFILES
    👤 PRIMARY PERSONAS:
    • [Persona Name]: [Age], [Gender], [Occupation]
      Key Interests: [Interest 1], [Interest 2]
      Pain Points: [Pain Point 1], [Pain Point 2]
      Goals: [Goal 1], [Goal 2]
    
    ## RECOMMENDED CHANNEL CONCEPTS
    🏆 TOP 5 CHANNEL CONCEPTS:
    1. [Title] - [Brief description]
       Keywords: [Keywords]
       Target Personas: [Personas]
       USP: [Unique selling point]
    
    ## CONTENT STRATEGY RECOMMENDATIONS
    📋 CONTENT THEMES:
    • [Theme 1]
    • [Theme 2]
    • [Theme 3]
    
    Make the information actionable and easy to understand, focusing on how these recommendations will help achieve business goals.
  `,
});

// Video Search Workflow
const videoSearch = new Step({
  id: 'video-search',
  description: 'Searches for YouTube videos based on a query',
  inputSchema: z.object({
    query: z.string().describe('Search query for videos'),
    maxResults: z.number().min(1).max(50).default(10).describe('Number of results to return'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      channelTitle: z.string(),
      publishedAt: z.string(),
      thumbnailUrl: z.string(),
      url: z.string(),
    })),
    totalResults: z.number(),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{ query: string, maxResults?: number }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    const maxResults = triggerData.maxResults || 10;
    
    return await youtubeSearchTool.execute({
      context: {
        query: triggerData.query,
        maxResults,
        type: 'video',
      }
    });
  },
});

const curateSuggestions = new Step({
  id: 'curate-suggestions',
  description: 'Curates and suggests videos from search results',
  execute: async ({ context, mastra }) => {
    const searchResults = context?.getStepResult(videoSearch);
    
    if (!searchResults || searchResults.results.length === 0) {
      throw new Error('Search results not found or empty');
    }
    
    const prompt = `Based on the following YouTube search results, provide curated recommendations:
      ${JSON.stringify(searchResults, null, 2)}
    `;
    
    const response = await contentCuratorAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let suggestionsText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      suggestionsText += chunk;
    }
    
    return {
      suggestions: suggestionsText,
    };
  },
});

// Channel Planning Workflow
const channelPlanning = new Step({
  id: 'channel-planning',
  description: 'Generates a YouTube channel plan based on product information',
  inputSchema: z.object({
    productDescription: z.string().describe('Description of the product or service being promoted'),
    websiteUrl: z.string().optional().describe('URL of the product/service website'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel'),
    industryCategory: z.string().optional().describe('Industry or business category'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      productDescription: string,
      websiteUrl?: string,
      targetAudience?: string,
      businessGoals?: string,
      industryCategory?: string
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    return await youtubeChannelPlannerTool.execute({
      context: {
        productDescription: triggerData.productDescription,
        websiteUrl: triggerData.websiteUrl,
        targetAudience: triggerData.targetAudience,
        businessGoals: triggerData.businessGoals,
        industryCategory: triggerData.industryCategory,
      }
    });
  },
});

const presentChannelStrategy = new Step({
  id: 'present-channel-strategy',
  description: 'Presents the channel strategy in a structured format',
  execute: async ({ context, mastra }) => {
    const planningResults = context?.getStepResult(channelPlanning);
    
    if (!planningResults) {
      throw new Error('Channel planning results not found');
    }
    
    const prompt = `Based on the following YouTube channel planning analysis, present a strategic channel plan:
      ${JSON.stringify(planningResults, null, 2)}
    `;
    
    const response = await channelPlannerAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let strategyText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      strategyText += chunk;
    }
    
    return {
      channelStrategy: strategyText,
    };
  },
});

const youtubeSearchWorkflow = new Workflow({
  name: 'youtube-search-workflow',
  triggerSchema: z.object({
    query: z.string().describe('Search query for videos'),
    maxResults: z.number().min(1).max(50).optional().default(10).describe('Number of results to return'),
  }),
})
  .step(videoSearch)
  .then(curateSuggestions);

const youtubeChannelPlannerWorkflow = new Workflow({
  name: 'youtube-channel-planner-workflow',
  triggerSchema: z.object({
    productDescription: z.string().describe('Description of the product or service being promoted'),
    websiteUrl: z.string().optional().describe('URL of the product/service website'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel'),
    industryCategory: z.string().optional().describe('Industry or business category'),
  }),
})
  .step(channelPlanning)
  .then(presentChannelStrategy);

youtubeSearchWorkflow.commit();
youtubeChannelPlannerWorkflow.commit();

export { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';

export { youtubeSearchWorkflow, youtubeChannelPlannerWorkflow };