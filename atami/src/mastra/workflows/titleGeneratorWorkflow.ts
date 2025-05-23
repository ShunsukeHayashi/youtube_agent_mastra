import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep, Workflow } from '@mastra/core';
import { z } from 'zod';
import { youtubeTitleGeneratorTool } from '../tools/titleGenerator';
import { titleGeneratorInputSchema } from '../types';

const llm = anthropic('claude-3-7-sonnet-20250219');

const titleGeneratorAgent = new Agent({
  name: 'YouTube Title & Thumbnail Strategist',
  model: llm,
  tools: { youtubeTitleGeneratorTool },
  instructions: `
    You are a YouTube marketing strategist specializing in crafting high-performing video titles and thumbnail text.
    
    When presented with title and thumbnail options, analyze them strategically to highlight the most effective options, focusing on:
    
    1. Click-through rate potential
    2. Audience appeal across multiple personas
    3. Psychological triggers employed
    4. SEO effectiveness
    5. Overall marketing strategy
    
    Format your strategic analysis as follows:
    
    ## THUMBNAIL TEXT ANALYSIS
    🔍 TOP 3 RECOMMENDATIONS WITH RATIONALE:
    1. "[Thumbnail Text 1]"
       - Appeal Rating: [★★★★★]
       - Key Strengths: [List specific strengths]
       - Persona Appeal: [How it resonates with different personas]
       - Psychological Triggers: [Which emotions/curiosity triggers it employs]
    
    ## TITLE RECOMMENDATIONS
    🏆 FOR THUMBNAIL #1:
    • "[Title Option 1]"
      - Click Appeal: [★★★★★]
      - SEO Strength: [High/Medium/Low]
      - Marketing Analysis: [Brief strategic insight]
    
    ## RECOMMENDED COMBINATIONS
    💯 BEST OVERALL MARKETING SETS:
    1. Thumbnail: "[Text]"
       Title: "[Title]"
       Strategy: [Why this combination works]
    
    ## VIDEO DESCRIPTION
    📝 STRATEGIC DESCRIPTION:
    [Description text with highlighted strategic elements]
    
    ## IMPLEMENTATION RECOMMENDATIONS
    🚀 NEXT STEPS:
    • [Specific advice for implementation]
    • [A/B testing suggestions if relevant]
    • [Additional marketing tips]
    
    Make your analysis actionable and strategic, focusing on how these elements will drive views, engagement, and channel growth.
  `,
});

// Title Generator Workflow
/**
 * Step to generate YouTube titles and thumbnail text based on video content
 */
/**
 * タイトル生成ステップ
 * 動画コンテンツに基づいてYouTubeタイトルとサムネイルテキストを生成する
 */
const generateTitlesAndThumbnails = createStep({
  id: 'generate-titles-thumbnails',
  description: 'Generates YouTube titles and thumbnail text based on video content',
  inputSchema: titleGeneratorInputSchema,
  outputSchema: z.object({
    personas: z.array(z.object({
      name: z.string(),
      age: z.string(),
      gender: z.string(),
      occupation: z.string(),
      interests: z.array(z.string()),
      painPoints: z.array(z.string()),
      goals: z.array(z.string()),
      viewingHabits: z.string(),
    })),
    thumbnailTextOptions: z.array(z.object({
      text: z.string(),
      rating: z.number(),
      rationale: z.string(),
      personaReactions: z.array(z.object({
        personaName: z.string(),
        reaction: z.string(),
      })),
    })),
    titleOptions: z.array(z.object({
      title: z.string(),
      rating: z.number(),
      rationale: z.string(),
      thumbnailTextId: z.number(),
    })),
    recommendedSets: z.array(z.object({
      thumbnailText: z.string(),
      titles: z.array(z.string()),
    })),
    videoDescription: z.object({
      description: z.string(),
      tags: z.array(z.string()),
    }),
  }),
  execute: async (params) => {
    try {
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const context = params.context;
      const triggerData = context?.getStepResult<{
        videoContent: string,
        seoKeywords?: string[],
        targetAudience?: string,
        videoCategory?: string,
        channelTheme?: string
      }>('trigger');
      
      if (!triggerData) {
        throw new Error('Trigger data not found');
      }
      
      // Validate required fields
      if (!triggerData.videoContent) {
        throw new Error('Video content is required');
      }
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      return await youtubeTitleGeneratorTool.execute({
        runtimeContext: params.runtimeContext,
        context: {
          videoContent: triggerData.videoContent,
          seoKeywords: triggerData.seoKeywords,
          targetAudience: triggerData.targetAudience,
          videoCategory: triggerData.videoCategory,
          channelTheme: triggerData.channelTheme,
        }
      });
    } catch (error) {
      console.error('Error generating titles and thumbnails:', error);
      throw error;
    }
  },
});

/**
 * Step to present the title and thumbnail strategy in a structured format
 */
/**
 * マーケティング戦略プレゼンテーションステップ
 * タイトルとサムネイル生成結果を元に戦略的なマーケティングプランを提示する
 */
const presentMarketingStrategy = createStep({
  id: 'present-marketing-strategy',
  description: 'Presents the title and thumbnail strategy in a structured format',
  inputSchema: z.object({}),
  outputSchema: z.object({
    marketingStrategy: z.string(),
    generationResults: z.object({
      personas: z.array(z.object({
        name: z.string(),
        age: z.string(),
        gender: z.string(),
        occupation: z.string(),
        interests: z.array(z.string()),
        painPoints: z.array(z.string()),
        goals: z.array(z.string()),
        viewingHabits: z.string(),
      })),
      thumbnailTextOptions: z.array(z.object({
        text: z.string(),
        rating: z.number(),
        rationale: z.string(),
        personaReactions: z.array(z.object({
          personaName: z.string(),
          reaction: z.string(),
        })),
      })),
      titleOptions: z.array(z.object({
        title: z.string(),
        rating: z.number(),
        rationale: z.string(),
        thumbnailTextId: z.number(),
      })),
      recommendedSets: z.array(z.object({
        thumbnailText: z.string(),
        titles: z.array(z.string()),
      })),
      videoDescription: z.object({
        description: z.string(),
        tags: z.array(z.string()),
      }),
    }),
  }),
  execute: async (params) => {
    try {
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const context = params.context;
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const mastra = params.mastra;
      const generationResults = context?.getStepResult(generateTitlesAndThumbnails);
      
      if (!generationResults) {
        throw new Error('Title and thumbnail generation results not found');
      }
      
      const prompt = `Based on the following YouTube title and thumbnail generation results, present a strategic marketing plan:
        ${JSON.stringify(generationResults, null, 2)}
      `;
      
      const response = await titleGeneratorAgent.stream([
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
        marketingStrategy: strategyText,
        generationResults: generationResults,
      };
    } catch (error) {
      console.error('Error presenting marketing strategy:', error);
      throw error;
    }
  },
});

// 一時的にワークフローの定義をコメントアウト
/**
 * YouTube Title Generator Workflow
 * 注意: 現在は実際のワークフローの代わりにダミー実装を使用しています
 */
/**
 * YouTube Title Generator Workflow
 * 動画コンテンツに基づいてタイトルとサムネイルテキストを生成し、マーケティング戦略を提示する
 */
const youtubeTitleGeneratorWorkflow = {
  name: 'youtube-title-generator-workflow',
  description: 'Generates YouTube titles and thumbnail text based on video content',
  
  // 実行メソッド
  run: async (input: {
    videoContent: string;
    seoKeywords?: string[];
    targetAudience?: string;
    videoCategory?: string;
    channelTheme?: string;
  }) => {
    try {
      console.log('YouTube Title Generator Workflow が実行されました');
      console.log('入力:', input);
      
      // 入力バリデーション
      if (!input || !input.videoContent) {
        return {
          success: false,
          message: 'Video content is required',
        };
      }
      
      // 実際のステップを実行
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step1Result = await generateTitlesAndThumbnails.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: () => input,
        },
      });
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step2Result = await presentMarketingStrategy.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: (step: typeof generateTitlesAndThumbnails) => {
            if (step === generateTitlesAndThumbnails) {
              return step1Result;
            }
            return null;
          },
        },
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        mastra: null,
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
        message: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
  
  // Mastraに登録するためのメソッド
  _mastra: null,
  __registerMastra: function(mastra: any) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

/*
// 実際のワークフロー定義（現在は使用していません）
const realWorkflow = new Workflow({
  name: 'youtube-title-generator-workflow',
  triggerSchema: z.object({
    videoContent: z.string().describe('The content/transcript of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
  }),
})
  .steps([generateTitlesAndThumbnails, presentMarketingStrategy]);
*/

export { youtubeTitleGeneratorWorkflow };