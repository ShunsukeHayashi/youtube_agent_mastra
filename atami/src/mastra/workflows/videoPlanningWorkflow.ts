import { openai } from '@ai-sdk/openai';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeVideoPlanningAgent } from '../agents/videoPlanningAgent';
import { youtubeVideoPlanningTool } from '../tools/videoPlanningSeo';
import { videoPlanningInputSchema } from '../types';

const llm = openai('gpt-4');

/**
 * Step to generate video planning and SEO optimization
 */
/**
 * 動画企画生成ステップ
 * チャンネルコンセプトとキーワードリサーチに基づいて戦略的なYouTube動画企画とSEO最適化を生成する
 */
const generateVideoPlan = createStep({
  id: 'generate-video-plan',
  description: 'Generate strategic YouTube video planning and SEO optimization based on channel concept and keyword research',
  inputSchema: videoPlanningInputSchema,
  outputSchema: z.object({
    keywordResearch: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      competition: z.string(),
      relevance: z.number(),
      rank: z.number(),
    })),
    competitorAnalysis: z.array(z.object({
      title: z.string(),
      channelName: z.string(),
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      publishDate: z.string(),
      duration: z.string(),
      engagementRate: z.number(),
      url: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })),
    contentStructure: z.array(z.object({
      section: z.string(),
      duration: z.string(),
      purpose: z.string(),
      description: z.string(),
    })),
    seoOptimization: z.object({
      recommendedTitle: z.string(),
      titleVariations: z.array(z.string()),
      description: z.string(),
      tags: z.array(z.object({
        tag: z.string(),
        relevance: z.number(),
        searchVolume: z.number(),
        competition: z.string(),
      })),
    }),
    audienceRetentionStrategies: z.array(z.object({
      technique: z.string(),
      implementation: z.string(),
      expectedImpact: z.string(),
      timeMarker: z.string(),
    })),
    differentiationPoints: z.array(z.string()),
    callToActionStrategy: z.string(),
    metadata: z.object({
      estimatedSearchRanking: z.string(),
      estimatedViewRetention: z.string(),
      processingTime: z.number(),
      channelConceptSource: z.string().optional(),
    }),
  }),
  execute: async (params) => {
    try {
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const context = params.context;
      const triggerData = context?.getStepResult<{
        channelConcept: string,
        targetAudience: string,
        videoTopic: string,
        existingKeywords?: string[],
        competitorChannels?: string[],
        videoDuration?: string,
        contentGoal?: string,
        channelConceptSource?: 'WORKFLOW-1' | 'direct',
      }>('trigger');

      if (!triggerData) {
        throw new Error('Trigger data not found');
      }

      // Validate required fields
      if (!triggerData.channelConcept) {
        throw new Error('Channel concept is required');
      }

      if (!triggerData.targetAudience) {
        throw new Error('Target audience is required');
      }

      if (!triggerData.videoTopic) {
        throw new Error('Video topic is required');
      }

      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      return await youtubeVideoPlanningTool.execute({
        runtimeContext: params.runtimeContext,
        context: {
          channelConcept: triggerData.channelConcept,
          targetAudience: triggerData.targetAudience,
          videoTopic: triggerData.videoTopic,
          existingKeywords: triggerData.existingKeywords,
          competitorChannels: triggerData.competitorChannels,
          videoDuration: triggerData.videoDuration,
          contentGoal: triggerData.contentGoal,
          channelConceptSource: triggerData.channelConceptSource,
        }
      });
    } catch (error) {
      console.error('Error generating video plan:', error);
      throw error;
    }
  },
});

/**
 * Step to present video planning strategy
 */
/**
 * 動画企画戦略プレゼンテーションステップ
 * 動画企画とSEO最適化の戦略を構造化された形式で提示する
 */
const presentVideoPlanStrategy = createStep({
  id: 'present-video-plan-strategy',
  description: 'Present the video planning and SEO optimization strategy in a structured format',
  inputSchema: z.object({}),
  outputSchema: z.object({
    videoPlanStrategy: z.string(),
    planningResults: z.object({
      keywordResearch: z.array(z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        competition: z.string(),
        relevance: z.number(),
        rank: z.number(),
      })),
      competitorAnalysis: z.array(z.object({
        title: z.string(),
        channelName: z.string(),
        views: z.number(),
        likes: z.number(),
        comments: z.number(),
        publishDate: z.string(),
        duration: z.string(),
        engagementRate: z.number(),
        url: z.string(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      })),
      contentStructure: z.array(z.object({
        section: z.string(),
        duration: z.string(),
        purpose: z.string(),
        description: z.string(),
      })),
      seoOptimization: z.object({
        recommendedTitle: z.string(),
        titleVariations: z.array(z.string()),
        description: z.string(),
        tags: z.array(z.object({
          tag: z.string(),
          relevance: z.number(),
          searchVolume: z.number(),
          competition: z.string(),
        })),
      }),
      audienceRetentionStrategies: z.array(z.object({
        technique: z.string(),
        implementation: z.string(),
        expectedImpact: z.string(),
        timeMarker: z.string(),
      })),
      differentiationPoints: z.array(z.string()),
      callToActionStrategy: z.string(),
      metadata: z.object({
        estimatedSearchRanking: z.string(),
        estimatedViewRetention: z.string(),
        processingTime: z.number(),
        channelConceptSource: z.string().optional(),
      }),
    }),
    metadata: z.object({
      estimatedSearchRanking: z.string(),
      estimatedViewRetention: z.string(),
      processingTime: z.number(),
      channelConceptSource: z.string().optional(),
    }),
  }),
  execute: async (params) => {
    try {
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const context = params.context;
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const mastra = params.mastra;
      const planningResults = context?.getStepResult(generateVideoPlan);

      if (!planningResults) {
        throw new Error('Video planning results not found');
      }

      const prompt = `以下のYouTube動画企画とSEO最適化の分析結果をもとに、戦略的な動画企画プランを提示してください：
        ${JSON.stringify(planningResults, null, 2)}
      `;

      const response = await youtubeVideoPlanningAgent.stream([
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
        videoPlanStrategy: strategyText,
        planningResults: planningResults,
        metadata: planningResults.metadata,
      };
    } catch (error) {
      console.error('Error presenting video plan strategy:', error);
      throw error;
    }
  },
});

// バリデーションステップ
const validateVideoPlanningInputStep = createStep({
  id: 'validate-video-planning-input',
  description: 'Validate input for video planning generation',
  inputSchema: z.object({
    channelConcept: z.string().describe('The concept of the YouTube channel'),
    targetAudience: z.string().describe('Description of the target audience'),
    videoTopic: z.string().describe('The main topic of the video'),
    existingKeywords: z.array(z.string()).optional().describe('Existing SEO keywords to include'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    videoDuration: z.string().optional().describe('Expected duration of the video'),
    contentGoal: z.string().optional().describe('Primary goal of the content'),
    channelConceptSource: z.enum(['WORKFLOW-1', 'direct']).optional(),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      channelConcept: z.string(),
      targetAudience: z.string(),
      videoTopic: z.string(),
      existingKeywords: z.array(z.string()).optional(),
      competitorChannels: z.array(z.string()).optional(),
      videoDuration: z.string().optional(),
      contentGoal: z.string().optional(),
      channelConceptSource: z.enum(['WORKFLOW-1', 'direct']).optional(),
    }).optional(),
  }),
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    const input = context?.getStepResult('trigger');

    if (!input) {
      return {
        isValid: false,
        message: 'Input data not found',
      };
    }

    if (!input.channelConcept) {
      return {
        isValid: false,
        message: 'Channel concept is required',
      };
    }

    if (!input.targetAudience) {
      return {
        isValid: false,
        message: 'Target audience is required',
      };
    }

    if (!input.videoTopic) {
      return {
        isValid: false,
        message: 'Video topic is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

/**
 * YouTube動画企画ワークフロー
 * チャンネルコンセプトとキーワードリサーチに基づいて動画企画を生成し、戦略を提示する
 */
const youtubeVideoPlanningWorkflow = createWorkflow({
  id: 'youtube-video-planning-workflow',
  description: 'Generate strategic YouTube video planning and SEO optimization based on channel concept and keyword research',
  inputSchema: z.object({
    channelConcept: z.string().describe('The concept of the YouTube channel'),
    targetAudience: z.string().describe('Description of the target audience'),
    videoTopic: z.string().describe('The main topic of the video'),
    existingKeywords: z.array(z.string()).optional().describe('Existing SEO keywords to include'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    videoDuration: z.string().optional().describe('Expected duration of the video'),
    contentGoal: z.string().optional().describe('Primary goal of the content'),
    channelConceptSource: z.enum(['WORKFLOW-1', 'direct']).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      keywordResearch: z.array(z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        competition: z.string(),
        relevance: z.number(),
        rank: z.number(),
      })),
      competitorAnalysis: z.array(z.object({
        title: z.string(),
        channelName: z.string(),
        views: z.number(),
        likes: z.number(),
        comments: z.number(),
        publishDate: z.string(),
        duration: z.string(),
        engagementRate: z.number(),
        url: z.string(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      })),
      contentStructure: z.array(z.object({
        section: z.string(),
        duration: z.string(),
        purpose: z.string(),
        description: z.string(),
      })),
      seoOptimization: z.object({
        recommendedTitle: z.string(),
        titleVariations: z.array(z.string()),
        description: z.string(),
        tags: z.array(z.object({
          tag: z.string(),
          relevance: z.number(),
          searchVolume: z.number(),
          competition: z.string(),
        })),
      }),
      audienceRetentionStrategies: z.array(z.object({
        technique: z.string(),
        implementation: z.string(),
        expectedImpact: z.string(),
        timeMarker: z.string(),
      })),
      differentiationPoints: z.array(z.string()),
      callToActionStrategy: z.string(),
      metadata: z.object({
        estimatedSearchRanking: z.string(),
        estimatedViewRetention: z.string(),
        processingTime: z.number(),
        channelConceptSource: z.string().optional(),
      }),
      videoPlanStrategy: z.string(),
    }).optional(),
  }),
})
  .then(validateVideoPlanningInputStep)
  .then(generateVideoPlan)
  .then(presentVideoPlanStrategy);

// ワークフローをコミット
youtubeVideoPlanningWorkflow.commit();

export { youtubeVideoPlanningWorkflow };