// @ts-nocheck - TypeScriptの型チェックを無効化
import { anthropic } from '@ai-sdk/anthropic';
import { createStep, Workflow } from '@mastra/core';
import { z } from 'zod';
import { youtubeThumbnailTitleGeneratorAgent } from '../agents/thumbnailTitleGeneratorAgent';
import { youtubeThumbnailTitleGeneratorTool } from '../tools/thumbnailTitleGenerator';

const llm = anthropic('claude-3-7-sonnet-20250219');

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

// ダミーのワークフローを作成
const youtubeThumbnailTitleGeneratorWorkflow = {
  name: 'youtube-thumbnail-title-generator-workflow',
  description: 'Generate high-CTR YouTube thumbnail text and titles based on video content or script',
  
  // ダミーメソッド
  run: async (input) => {
    console.log('YouTube Thumbnail & Title Generator Workflow が実行されました');
    console.log('入力:', input);
    
    // 実際のステップを実行
    try {
      const step1Result = await generateThumbnailsAndTitles.execute({
        context: {
          getStepResult: () => input,
        },
      });
      
      const step2Result = await presentOptimizationStrategy.execute({
        context: {
          getStepResult: (step) => {
            if (step === generateThumbnailsAndTitles) {
              return step1Result;
            }
            return null;
          },
        },
      });
      
      return {
        success: true,
        message: 'ワークフローが正常に実行されました',
        result: {
          ...step1Result,
          ...step2Result,
        },
      };
    } catch (error) {
      console.error('ワークフロー実行エラー:', error);
      return {
        success: false,
        message: `エラーが発生しました: ${error.message}`,
      };
    }
  },
  
  // Mastraに登録するためのダミーメソッド
  _mastra: null,
  __registerMastra: function(mastra) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

export { youtubeThumbnailTitleGeneratorWorkflow };