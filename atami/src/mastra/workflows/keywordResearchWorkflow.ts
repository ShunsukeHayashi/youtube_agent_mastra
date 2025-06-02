/**
 * YouTube Keyword Research Workflow
 * 
 * Researches YouTube keywords to find search volume and related keywords
 * using the Keyword Tool API.
 */
import { anthropic } from '@ai-sdk/anthropic';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeKeywordResearchAgent } from '../agents/keywordResearchAgent';
import { youtubeKeywordResearchTool } from '../tools/keywordResearch';
import { StepParams, YouTubeKeywordResearchParams } from '../types/stepTypes';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * Interface for keyword research results
 */
interface KeywordResearchResult {
  mainKeyword: {
    keyword: string;
    searchVolume: number | null;
    competition: string | null;
  };
  relatedKeywords: Array<{
    keyword: string;
    searchVolume: number | null;
    competition: string | null;
  }>;
  metadata: {
    apiKeyUsed: boolean;
    timestamp: number;
  };
}

// Keyword research step
const researchKeywords = createStep({
  id: 'research-keywords',
  description: 'Research keywords using Keyword Tool API to get search volume and related keywords',
  inputSchema: z.object({
    keyword: z.string().describe('The main keyword to research'),
    location: z.string().default('jp').describe('Location for search metrics (e.g., jp, us)'),
    language: z.string().default('ja').describe('Language for search metrics (e.g., ja, en)'),
    limit: z.number().default(20).describe('Maximum number of results to return'),
    includeRelated: z.boolean().default(true).describe('Whether to include related keywords'),
    source: z.enum(['youtube', 'google', 'amazon', 'bing', 'ebay', 'app-store', 'play-store', 'instagram', 'twitter']).default('youtube').describe('Source platform for keyword research'),
    businessCategory: z.string().optional().describe('Business or industry category'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
  }),
  outputSchema: z.object({
    mainKeyword: z.object({
      keyword: z.string(),
      searchVolume: z.number().nullable(),
      competition: z.string().nullable(),
    }),
    relatedKeywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number().nullable(),
      competition: z.string().nullable(),
    })),
    metadata: z.object({
      apiKeyUsed: z.boolean(),
      timestamp: z.number(),
    }),
  }),
  execute: async (params: StepParams<YouTubeKeywordResearchParams>) => {
    const triggerData = params.context.getStepResult<YouTubeKeywordResearchParams>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await youtubeKeywordResearchTool.execute({
      context: {
        keyword: triggerData.keyword,
        location: triggerData.location || 'jp',
        language: triggerData.language || 'ja',
        limit: triggerData.limit || 20,
        includeRelated: triggerData.includeRelated !== false,
        source: triggerData.source || 'youtube',
      }
    });
  },
});

// Keyword strategy presentation step
const presentKeywordStrategy = createStep({
  id: 'present-keyword-strategy',
  description: 'Present the keyword research results and strategy in a structured format',
  inputSchema: z.object({}),
  outputSchema: z.object({
    keywordStrategy: z.string(),
    metadata: z.object({
      apiKeyUsed: z.boolean(),
      timestamp: z.number(),
    }),
  }),
  execute: async (params: StepParams) => {
    const researchResults = params.context.getStepResult<KeywordResearchResult>(researchKeywords);

    if (!researchResults) {
      throw new Error('Keyword research results not found');
    }

    const triggerData = params.context.getStepResult<{
      businessCategory?: string,
      targetAudience?: string,
    }>('trigger');

    let businessContext = '';
    if (triggerData?.businessCategory || triggerData?.targetAudience) {
      businessContext = `
Business Category: ${triggerData?.businessCategory || 'Not specified'}
Target Audience: ${triggerData?.targetAudience || 'Not specified'}
      `.trim();
    }

    // Get additional information from metadata
    const { apiKeyUsed, timestamp } = researchResults.metadata;

    const prompt = `Based on the following keyword research results, please provide strategic keyword recommendations for YouTube video SEO optimization:
      ${JSON.stringify(researchResults, null, 2)}
      
      ${businessContext}
      
      Note: This data was generated on ${new Date(timestamp).toLocaleString('en-US')} using ${apiKeyUsed ? 'actual API data' : 'mock data'}.
    `;

    // Temporarily return mock data instead of using the agent (API key required)
    console.log('Using mock data (Anthropic API key not set)');

    // Mock strategy text
    const strategyText = `
## 📊 Main Keyword Analysis
- 🔍 "${researchResults.mainKeyword.keyword}"
  • Search Volume: ${researchResults.mainKeyword.searchVolume || 'No data'}/month
  • Competition: ${researchResults.mainKeyword.competition || 'Medium'}
  • Trend: Stable

## 🔑 High Volume Related Keywords (Top 10)
${researchResults.relatedKeywords.slice(0, 10).map((kw, i) =>
      `${i + 1}. "${kw.keyword}" - ${kw.searchVolume || 0}/month`
    ).join('\n')}

## 💎 Niche Keywords (Low Competition)
${researchResults.relatedKeywords
        .filter(kw => kw.competition === 'Low')
        .slice(0, 5)
        .map((kw, i) => `${i + 1}. "${kw.keyword}" - ${kw.searchVolume || 0}/month | Competition: Low`)
        .join('\n') || 'No low competition keywords found.'}

## 🎯 Recommended Keyword Strategy
- Main Keyword: "${researchResults.mainKeyword.keyword}"
- Support Keywords:
  1. "${researchResults.relatedKeywords[0]?.keyword || 'No data'}"
  2. "${researchResults.relatedKeywords[1]?.keyword || 'No data'}"
  3. "${researchResults.relatedKeywords[2]?.keyword || 'No data'}"

## 📋 SEO Optimization Advice
- Title Integration: Place the main keyword at the beginning of the title and naturally incorporate support keywords
- Description Integration: Include the main keyword in the first 2-3 sentences and scatter support keywords throughout the description
- Tag Strategy: Always include main and support keywords in tags
- Thumbnail Optimization: Visually represent keywords with eye-catching design

Note: This data was generated using ${apiKeyUsed ? 'actual API data' : 'mock data'}. Actual search volumes may vary.
    `;

    // Display output to console
    console.log(strategyText);

    return {
      keywordStrategy: strategyText,
      metadata: researchResults.metadata,
    };
  },
});

// Validation step
const validateKeywordResearchInputStep = createStep({
  id: 'validate-keyword-research-input',
  description: 'Validate input for keyword research',
  inputSchema: z.object({
    keyword: z.string().describe('The main keyword to research'),
    location: z.string().optional().default('jp').describe('Location for search metrics (e.g., jp, us)'),
    language: z.string().optional().default('ja').describe('Language for search metrics (e.g., ja, en)'),
    limit: z.number().optional().default(20).describe('Maximum number of results to return'),
    includeRelated: z.boolean().optional().default(true).describe('Whether to include related keywords'),
    source: z.enum(['youtube', 'google', 'amazon', 'bing', 'ebay', 'app-store', 'play-store', 'instagram', 'twitter']).optional().default('youtube').describe('Source platform for keyword research'),
    businessCategory: z.string().optional().describe('Business or industry category'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      keyword: z.string(),
      location: z.string().optional(),
      language: z.string().optional(),
      limit: z.number().optional(),
      includeRelated: z.boolean().optional(),
      source: z.enum(['youtube', 'google', 'amazon', 'bing', 'ebay', 'app-store', 'play-store', 'instagram', 'twitter']).optional(),
      businessCategory: z.string().optional(),
      targetAudience: z.string().optional(),
    }).optional(),
  }),
  execute: async (params: StepParams) => {
    const input = params.context.getStepResult('trigger');

    if (!input) {
      return {
        isValid: false,
        message: 'Input data not found',
      };
    }

    if (!input.keyword) {
      return {
        isValid: false,
        message: 'Keyword is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

/**
 * YouTube Keyword Research Workflow 
 * 
 * This workflow researches keywords for YouTube content using the Keyword Tool API
 * and generates strategic keyword recommendations.
 */
const youtubeKeywordResearchWorkflow = createWorkflow({
  id: 'youtube-keyword-research-workflow',
  description: 'Research keywords using Keyword Tool API and generate strategic keyword recommendations',
  inputSchema: z.object({
    keyword: z.string().describe('The main keyword to research'),
    location: z.string().optional().default('jp').describe('Location for search metrics (e.g., jp, us)'),
    language: z.string().optional().default('ja').describe('Language for search metrics (e.g., ja, en)'),
    limit: z.number().optional().default(20).describe('Maximum number of results to return'),
    includeRelated: z.boolean().optional().default(true).describe('Whether to include related keywords'),
    source: z.enum(['youtube', 'google', 'amazon', 'bing', 'ebay', 'app-store', 'play-store', 'instagram', 'twitter']).optional().default('youtube').describe('Source platform for keyword research'),
    businessCategory: z.string().optional().describe('Business or industry category'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      mainKeyword: z.object({
        keyword: z.string(),
        searchVolume: z.number().nullable(),
        competition: z.string().nullable(),
      }),
      relatedKeywords: z.array(z.object({
        keyword: z.string(),
        searchVolume: z.number().nullable(),
        competition: z.string().nullable(),
      })),
      metadata: z.object({
        apiKeyUsed: z.boolean(),
        timestamp: z.number(),
      }),
      keywordStrategy: z.string(),
    }).optional(),
  }),
})
  .then(validateKeywordResearchInputStep)
  .then(researchKeywords)
  .then(presentKeywordStrategy);

// Commit the workflow
youtubeKeywordResearchWorkflow.commit();

export { youtubeKeywordResearchWorkflow };