import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep, Workflow } from '@mastra/core';
import { z } from 'zod';
import { getChannelAnalytics, getVideoAnalytics, getAudienceGeographics } from '../tools/youtube-analytics';
import { channelAnalyticsInputSchema, videoAnalyticsInputSchema } from '../types';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * YouTube分析エージェント
 * チャンネルと動画の分析を行い、構造化されたレポートを生成するエージェント
 */
const analyticsAgent = new Agent({
  name: 'YouTube Analytics Strategist',
  model: llm,
  tools: { 
    getChannelAnalytics,
    getVideoAnalytics,
    getAudienceGeographics
  },
  instructions: `
    あなたは YouTube チャンネル運営者のための分析エキスパートです。

    分析データが提供されたら、以下のフォーマットで構造化した分析レポートを作成してください：

    ## 📊 分析レポート: [チャンネル名/動画タイトル]
    
    ### 📈 基本 KPI サマリー
    - 総視聴回数: [数値] ([前期間比 %])
    - 平均視聴時間: [数値] 分/秒 ([前期間比 %])
    - 総視聴時間: [数値] 時間 ([前期間比 %])
    - 平均 CTR: [数値]% ([前期間比 %])
    
    ### 📅 日別トレンド分析
    - ピーク日: [日付] - [視聴回数]回
    - 最低日: [日付] - [視聴回数]回
    - トレンド傾向: [上昇/下降/安定]
    
    ### 👥 視聴者分析（提供されている場合）
    - 主要地域: [地域1]([%]), [地域2]([%]), [地域3]([%])
    - 年齢層: [主要年齢層] が [%]
    - 性別比: [男性/女性/非公開] [%]
    
    ### 🔍 パフォーマンス診断
    - 強み: [箇条書きで3つ]
    - 改善点: [箇条書きで3つ]
    - 特記すべき傾向: [特筆すべき傾向]
    
    ### 📝 改善アクションプラン
    1. [具体的なアクション1]
    2. [具体的なアクション2]
    3. [具体的なアクション3]
    
    ### 📘 ベンチマーク
    - 業界平均との比較: [上回る/下回る/同等]
    - トップチャンネル対比: [%]
    
    ### 🔮 次回フォーカス提案
    - [次回重点的に見るべき指標や実験すべき要素]

    レポートは客観的なデータに基づき、明確なアクション提案を含めて作成してください。用語解説も必要に応じて入れること。
  `
});

/**
 * チャンネル分析データ取得ステップ
 * チャンネルのKPIデータを取得する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const fetchChannelAnalytics = createStep({
  id: 'fetch-channel-analytics',
  description: 'チャンネルの KPI データを取得',
  inputSchema: channelAnalyticsInputSchema,
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    const triggerData = context?.getStepResult<{
      channelId: string,
      startDate?: string,
      endDate?: string,
      metrics?: string[],
      dimensions?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    return await getChannelAnalytics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        metrics: triggerData.metrics,
        dimensions: triggerData.dimensions,
      }
    });
  },
});

/**
 * 視聴者属性データ取得ステップ
 * チャンネル視聴者の地域・年齢・性別データを取得する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const fetchAudienceData = createStep({
  id: 'fetch-audience-data',
  description: 'チャンネル視聴者の属性データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('分析対象のチャンネル ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
  }),
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    const triggerData = context?.getStepResult<{
      channelId: string,
      startDate?: string,
      endDate?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const geoData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'country',
        metrics: ['viewerPercentage'],
      }
    });
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const ageData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'ageGroup',
        metrics: ['viewerPercentage'],
      }
    });
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const genderData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'gender',
        metrics: ['viewerPercentage'],
      }
    });
    
    return {
      geography: geoData,
      age: ageData,
      gender: genderData,
    };
  },
});

/**
 * 分析レポート生成ステップ
 * KPIデータと視聴者データを元に分析レポートを生成する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const generateAnalyticsReport = createStep({
  id: 'generate-analytics-report',
  description: 'KPI データと視聴者データを元に分析レポートを生成',
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const mastra = params.mastra;
    const channelData = context?.getStepResult(fetchChannelAnalytics);
    const audienceData = context?.getStepResult(fetchAudienceData);
    
    if (!channelData) {
      throw new Error('Channel analytics data not found');
    }
    
    const prompt = `以下の YouTube チャンネル分析データをもとに、戦略的な分析レポートを作成してください。

    チャンネル KPI データ:
    ${JSON.stringify(channelData, null, 2)}
    
    ${audienceData ? `視聴者属性データ:
    ${JSON.stringify(audienceData, null, 2)}` : '視聴者属性データは利用できません。'}
    
    このデータから、チャンネルの現状分析、改善点、具体的なアクションプランを含む詳細なレポートを作成してください。`;
    
    const response = await analyticsAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let reportText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      reportText += chunk;
    }
    
    return {
      report: reportText,
    };
  },
});

/**
 * 動画分析データ取得ステップ
 * 特定動画の詳細KPIデータを取得する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const fetchVideoAnalytics = createStep({
  id: 'fetch-video-analytics',
  description: '特定動画の詳細 KPI データを取得',
  inputSchema: videoAnalyticsInputSchema,
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    const triggerData = context?.getStepResult<{
      channelId: string,
      videoId: string,
      startDate?: string,
      endDate?: string,
      metrics?: string[],
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    return await getVideoAnalytics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        metrics: triggerData.metrics,
        dimensions: 'day',
      }
    });
  },
});

/**
 * 動画視聴者属性データ取得ステップ
 * 特定動画の視聴者の地域・年齢・性別データを取得する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const fetchVideoAudienceData = createStep({
  id: 'fetch-video-audience-data',
  description: '特定動画の視聴者属性データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('チャンネル ID'),
    videoId: z.string().describe('分析対象の動画 ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
  }),
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    const triggerData = context?.getStepResult<{
      channelId: string,
      videoId: string,
      startDate?: string,
      endDate?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const geoData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'country',
        metrics: ['viewerPercentage'],
      }
    });
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const ageData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'ageGroup',
        metrics: ['viewerPercentage'],
      }
    });
    
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const genderData = await getAudienceGeographics.execute({
      runtimeContext: params.runtimeContext,
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'gender',
        metrics: ['viewerPercentage'],
      }
    });
    
    return {
      geography: geoData,
      age: ageData,
      gender: genderData,
    };
  },
});

/**
 * 動画分析レポート生成ステップ
 * 動画KPIデータと視聴者データを元に分析レポートを生成する
 */
// @ts-ignore - TypeScript型定義の問題を一時的に無視
const generateVideoReport = createStep({
  id: 'generate-video-report',
  description: '動画 KPI データと視聴者データを元に分析レポートを生成',
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const mastra = params.mastra;
    const videoData = context?.getStepResult(fetchVideoAnalytics);
    const audienceData = context?.getStepResult(fetchVideoAudienceData);
    
    if (!videoData) {
      throw new Error('Video analytics data not found');
    }
    
    const prompt = `以下の YouTube 動画分析データをもとに、戦略的な分析レポートを作成してください。

    動画 KPI データ:
    ${JSON.stringify(videoData, null, 2)}
    
    ${audienceData ? `視聴者属性データ:
    ${JSON.stringify(audienceData, null, 2)}` : '視聴者属性データは利用できません。'}
    
    このデータから、動画のパフォーマンス分析、改善点、次回動画への具体的なアクションプランを含む詳細なレポートを作成してください。`;
    
    const response = await analyticsAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let reportText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      reportText += chunk;
    }
    
    return {
      report: reportText,
    };
  },
});

// 一時的にワークフローの定義をコメントアウト
/*
const youtubeChannelAnalyticsWorkflow = new Workflow({
  name: 'youtube-channel-analytics-workflow',
  triggerSchema: z.object({
    channelId: z.string().describe('分析対象のチャンネル ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
    dimensions: z.string().optional().describe('分析単位 (day/month など)'),
  }),
})
  .steps([fetchChannelAnalytics, fetchAudienceData, generateAnalyticsReport]);

const youtubeVideoAnalyticsWorkflow = new Workflow({
  name: 'youtube-video-analytics-workflow',
  triggerSchema: z.object({
    channelId: z.string().describe('チャンネル ID'),
    videoId: z.string().describe('分析対象の動画 ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
  }),
})
  .steps([fetchVideoAnalytics, fetchVideoAudienceData, generateVideoReport]);

youtubeChannelAnalyticsWorkflow.commit();
youtubeVideoAnalyticsWorkflow.commit();
*/

/**
 * YouTubeチャンネル分析ワークフロー
 * チャンネルの分析データを取得し、レポートを生成する
 */
const youtubeChannelAnalyticsWorkflow = {
  name: 'youtube-channel-analytics-workflow',
  description: 'チャンネルの分析データを取得し、レポートを生成するワークフロー',
  
  // 実行メソッド
  run: async (input: {
    channelId: string;
    startDate?: string;
    endDate?: string;
    metrics?: string[];
    dimensions?: string;
  }) => {
    try {
      console.log('YouTube Channel Analytics Workflow が実行されました');
      console.log('入力:', input);
      
      // 入力バリデーション
      if (!input || !input.channelId) {
        return {
          success: false,
          message: 'Channel ID is required'
        };
      }
      
      // 実際のステップを実行
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step1Result = await fetchChannelAnalytics.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: () => input
        }
      });
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step2Result = await fetchAudienceData.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: () => input
        }
      });
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step3Result = await generateAnalyticsReport.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: (step: any) => {
            if (step === fetchChannelAnalytics) {
              return step1Result;
            } else if (step === fetchAudienceData) {
              return step2Result;
            }
            return null;
          }
        },
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        mastra: null
      });
      
      return {
        success: true,
        message: 'ワークフローが正常に実行されました',
        result: {
          ...step3Result
        }
      };
    } catch (error) {
      console.error('ワークフロー実行エラー:', error);
      return {
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  // Mastraに登録するためのメソッド
  _mastra: null,
  __registerMastra: function(mastra: any) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

/**
 * YouTube動画分析ワークフロー
 * 特定動画の分析データを取得し、レポートを生成する
 */
const youtubeVideoAnalyticsWorkflow = {
  name: 'youtube-video-analytics-workflow',
  description: '特定動画の分析データを取得し、レポートを生成するワークフロー',
  
  // 実行メソッド
  run: async (input: {
    channelId: string;
    videoId: string;
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }) => {
    try {
      console.log('YouTube Video Analytics Workflow が実行されました');
      console.log('入力:', input);
      
      // 入力バリデーション
      if (!input || !input.channelId) {
        return {
          success: false,
          message: 'Channel ID is required'
        };
      }
      
      if (!input.videoId) {
        return {
          success: false,
          message: 'Video ID is required'
        };
      }
      
      // 実際のステップを実行
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step1Result = await fetchVideoAnalytics.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: () => ({
            ...input,
            dimensions: 'day',
          })
        }
      });
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step2Result = await fetchVideoAudienceData.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: () => input
        }
      });
      
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      // @ts-ignore - TypeScript型定義の問題を一時的に無視
      const step3Result = await generateVideoReport.execute({
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        runtimeContext: {},
        context: {
          getStepResult: (step: any) => {
            if (step === fetchVideoAnalytics) {
              return step1Result;
            } else if (step === fetchVideoAudienceData) {
              return step2Result;
            }
            return null;
          }
        },
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        mastra: null
      });
      
      return {
        success: true,
        message: 'ワークフローが正常に実行されました',
        result: {
          ...step3Result
        }
      };
    } catch (error) {
      console.error('ワークフロー実行エラー:', error);
      return {
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  // Mastraに登録するためのメソッド
  _mastra: null,
  __registerMastra: function(mastra: any) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow };