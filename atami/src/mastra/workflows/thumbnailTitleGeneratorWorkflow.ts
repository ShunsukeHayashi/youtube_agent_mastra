// @ts-nocheck - TypeScriptの型チェックを無効化
import { openai } from '@ai-sdk/openai';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeThumbnailTitleGeneratorAgent } from '../agents/thumbnailTitleGeneratorAgent';
import { youtubeThumbnailTitleGeneratorTool } from '../tools/thumbnailTitleGenerator';

const llm = openai('gpt-4');

// サムネイル・タイトル生成ステップ
const generateThumbnailsAndTitles = createStep({
  id: 'generate-thumbnails-titles',
  description: 'Generate high-CTR YouTube thumbnail text and titles based on video content or script',
  inputSchema: z.object({
    videoContent: z.string().describe('The content summary or full script of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
    scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
  }),
  outputSchema: z.object({
    thumbnailOptions: z.array(z.object({
      text: z.string(),
      rationale: z.string(),
      psychologicalTriggers: z.array(z.string()),
      targetPersona: z.string(),
    })),
    titleOptions: z.array(z.object({
      title: z.string(),
      rationale: z.string(),
      seoKeywordsUsed: z.array(z.string()),
      psychologicalTriggers: z.array(z.string()),
      thumbnailPairings: z.array(z.number()),
    })),
    recommendedCombinations: z.array(z.object({
      thumbnailIndex: z.number(),
      titleIndex: z.number(),
      rationale: z.string(),
    })),
    metadata: z.object({
      processingTime: z.number(),
      scriptSource: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      videoContent: string,
      seoKeywords?: string[],
      targetAudience?: string,
      videoCategory?: string,
      channelTheme?: string,
      scriptSource?: 'WORKFLOW-3' | 'WORKFLOW-7' | 'direct',
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await youtubeThumbnailTitleGeneratorTool.execute({
      context: {
        videoContent: triggerData.videoContent,
        seoKeywords: triggerData.seoKeywords,
        targetAudience: triggerData.targetAudience,
        videoCategory: triggerData.videoCategory,
        channelTheme: triggerData.channelTheme,
        scriptSource: triggerData.scriptSource,
      }
    });
  },
});

// 最適化戦略プレゼンテーションステップ
const presentOptimizationStrategy = createStep({
  id: 'present-optimization-strategy',
  description: 'Present the thumbnail and title optimization strategy in a structured format',
  inputSchema: z.object({}),
  outputSchema: z.object({
    optimizationStrategy: z.string(),
    metadata: z.object({
      processingTime: z.number(),
      scriptSource: z.string().optional(),
    }),
  }),
  execute: async ({ context, mastra }) => {
    const generationResults = context?.getStepResult(generateThumbnailsAndTitles);

    if (!generationResults) {
      throw new Error('Thumbnail and title generation results not found');
    }

    const prompt = `以下のYouTubeサムネイルとタイトル生成結果をもとに、戦略的な最適化プランを提示してください：
      ${JSON.stringify(generationResults, null, 2)}
    `;

    const response = await youtubeThumbnailTitleGeneratorAgent.stream([
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
      optimizationStrategy: strategyText,
      metadata: generationResults.metadata,
    };
  },
});

// バリデーションステップ
const validateThumbnailTitleGeneratorInputStep = createStep({
  id: 'validate-thumbnail-title-generator-input',
  description: 'Validate input for thumbnail and title generation',
  inputSchema: z.object({
    videoContent: z.string().describe('The content summary or full script of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
    scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      videoContent: z.string(),
      seoKeywords: z.array(z.string()).optional(),
      targetAudience: z.string().optional(),
      videoCategory: z.string().optional(),
      channelTheme: z.string().optional(),
      scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional(),
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

    if (!input.videoContent) {
      return {
        isValid: false,
        message: 'Video content is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

// 新しいワークフロー定義
const youtubeThumbnailTitleGeneratorWorkflow = createWorkflow({
  id: 'youtube-thumbnail-title-generator-workflow',
  description: 'Generate high-CTR YouTube thumbnail text and titles based on video content or script',
  inputSchema: z.object({
    videoContent: z.string().describe('The content summary or full script of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
    scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      thumbnailOptions: z.array(z.object({
        text: z.string(),
        rationale: z.string(),
        psychologicalTriggers: z.array(z.string()),
        targetPersona: z.string(),
      })),
      titleOptions: z.array(z.object({
        title: z.string(),
        rationale: z.string(),
        seoKeywordsUsed: z.array(z.string()),
        psychologicalTriggers: z.array(z.string()),
        thumbnailPairings: z.array(z.number()),
      })),
      recommendedCombinations: z.array(z.object({
        thumbnailIndex: z.number(),
        titleIndex: z.number(),
        rationale: z.string(),
      })),
      metadata: z.object({
        processingTime: z.number(),
        scriptSource: z.string().optional(),
      }),
      optimizationStrategy: z.string(),
    }).optional(),
  }),
})
  .then(validateThumbnailTitleGeneratorInputStep)
  .then(generateThumbnailsAndTitles)
  .then(presentOptimizationStrategy);

// ワークフローをコミット
youtubeThumbnailTitleGeneratorWorkflow.commit();

export { youtubeThumbnailTitleGeneratorWorkflow };