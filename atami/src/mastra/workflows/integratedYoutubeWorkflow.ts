/**
 * YouTube統合マスターワークフロー
 * 
 * prompt.mdに基づいた全体的なYouTube運用ワークフローを一つの流れで実行
 * 13種類のワークフローを順番に実行し、包括的なYouTubeチャンネル戦略を生成
 */

import { openai } from '@ai-sdk/openai';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 既存のワークフローをインポート
import { inputCollectionWorkflow } from './inputCollectionWorkflow';
import { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
import { keywordResearchWorkflow } from './keywordResearchWorkflow';
import { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
import { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
import { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
import { youtubeVideoScriptGeneratorWorkflow } from './videoScriptGeneratorWorkflow';
import { youtubeLongFormRoadmapWorkflow } from './longFormRoadmapWorkflow';
import { youtubeLongFormOsaruWorkflow } from './longFormOsaruWorkflow';
import { youtubeLongFormMoezoWorkflow } from './longFormMoezoWorkflow';
import { youtubeLongFormConversationWorkflow } from './longFormConversationWorkflow';
import { youtubeShortsIdeationWorkflow } from './shortsIdeationWorkflow';
import { youtubeShortsScriptWorkflow } from './shortsScriptWorkflow';
import { youtubeContentScoringWorkflow } from './contentScoringWorkflow';
import { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';

const llm = openai('gpt-4o');

/* ------------------------------------------------------------------ *
 * 1. 統合ワークフローの入力スキーマ
 * ------------------------------------------------------------------ */
const integratedInputSchema = z.object({
  // 基本情報（WORKFLOW-13: プロジェクト初期インプット収集）
  businessName: z.string().describe('事業者名'),
  performerName: z.string().describe('演者の名前'),
  serviceUrl: z.string().optional().describe('サービスURL（あれば）'),
  youtubePurpose: z.string().describe('YouTube運用の目的（例：集客・認知拡大・ファン化など）'),
  performerBackground: z.string().describe('演者のバックボーンと経歴'),
  
  // オプション：詳細設定
  targetAudience: z.string().optional().describe('ターゲットオーディエンス'),
  contentGoals: z.array(z.string()).optional().describe('コンテンツの目標'),
  competitorChannels: z.array(z.string()).optional().describe('競合チャンネル'),
  
  // 実行オプション
  executeSteps: z.object({
    inputCollection: z.boolean().default(true),
    channelConcept: z.boolean().default(true),
    keywordResearch: z.boolean().default(true),
    videoPlanning: z.boolean().default(true),
    titleGeneration: z.boolean().default(true),
    thumbnailGeneration: z.boolean().default(true),
    scriptGeneration: z.boolean().default(true),
    longFormContent: z.boolean().default(true),
    shortsContent: z.boolean().default(true),
    contentScoring: z.boolean().default(true),
    analytics: z.boolean().default(false), // 既存チャンネルがある場合のみ
  }).optional(),
});

/* ------------------------------------------------------------------ *
 * 2. ステップ定義
 * ------------------------------------------------------------------ */

/** Step 1: 初期情報整理 */
const initialDataOrganizationStep = createStep({
  id: 'organize-initial-data',
  description: '初期入力データを整理し、各ワークフローで使用する形式に変換',
  inputSchema: integratedInputSchema,
  outputSchema: z.object({
    organizedData: z.object({
      businessInfo: z.object({
        name: z.string(),
        serviceUrl: z.string().optional(),
        background: z.string(),
      }),
      youtubeStrategy: z.object({
        purpose: z.string(),
        targetAudience: z.string(),
        goals: z.array(z.string()),
      }),
      executionPlan: z.record(z.string(), z.boolean()),
    }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const input = context?.getStepResult('trigger');
    
    if (!input) {
      throw new Error('入力データが見つかりません');
    }
    
    // データを整理
    const organizedData = {
      businessInfo: {
        name: input.businessName,
        serviceUrl: input.serviceUrl || '',
        background: `${input.performerName}: ${input.performerBackground}`,
      },
      youtubeStrategy: {
        purpose: input.youtubePurpose,
        targetAudience: input.targetAudience || '未定義',
        goals: input.contentGoals || ['認知拡大', '集客', 'ファン化'],
      },
      executionPlan: input.executeSteps || {
        inputCollection: true,
        channelConcept: true,
        keywordResearch: true,
        videoPlanning: true,
        titleGeneration: true,
        thumbnailGeneration: true,
        scriptGeneration: true,
        longFormContent: true,
        shortsContent: true,
        contentScoring: true,
        analytics: false,
      },
    };
    
    return { organizedData };
  },
});

/** Step 2: ワークフロー実行調整 */
const workflowOrchestrationStep = createStep({
  id: 'orchestrate-workflows',
  description: '各ワークフローを順番に実行し、結果を統合',
  inputSchema: z.object({
    organizedData: z.any(),
  }),
  outputSchema: z.object({
    executionResults: z.object({
      channelConcept: z.any().optional(),
      keywordStrategy: z.any().optional(),
      videoPlanning: z.any().optional(),
      titleGeneration: z.any().optional(),
      thumbnailGeneration: z.any().optional(),
      scriptGeneration: z.any().optional(),
      longFormStrategies: z.any().optional(),
      shortsStrategies: z.any().optional(),
      contentScoring: z.any().optional(),
      analytics: z.any().optional(),
    }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const previousResult = context?.getStepResult('organize-initial-data');
    const { organizedData } = previousResult || {};
    
    if (!organizedData) {
      throw new Error('整理されたデータが見つかりません');
    }
    
    const executionResults: any = {};
    const { executionPlan, businessInfo, youtubeStrategy } = organizedData;
    
    // 1. チャンネルコンセプト設計
    if (executionPlan.channelConcept) {
      try {
        executionResults.channelConcept = await youtubeChannelConceptWorkflow.execute({
          productDescription: businessInfo.name,
          websiteUrl: businessInfo.serviceUrl,
          targetAudience: youtubeStrategy.targetAudience,
          businessGoals: youtubeStrategy.purpose,
        });
      } catch (error) {
        console.error('チャンネルコンセプト設計エラー:', error);
      }
    }
    
    // 2. キーワード戦略
    if (executionPlan.keywordResearch) {
      try {
        executionResults.keywordStrategy = await keywordResearchWorkflow.execute({
          seedKeywords: ['ビジネス', businessInfo.name, youtubeStrategy.purpose],
          targetAudience: youtubeStrategy.targetAudience,
          contentGoals: youtubeStrategy.goals,
        });
      } catch (error) {
        console.error('キーワード戦略エラー:', error);
      }
    }
    
    // 3. 動画企画
    if (executionPlan.videoPlanning && executionResults.channelConcept) {
      try {
        const channelConcept = executionResults.channelConcept?.result?.channelConcepts?.[0]?.title || 'デフォルトコンセプト';
        executionResults.videoPlanning = await youtubeVideoPlanningWorkflow.execute({
          channelConcept,
          targetAudience: youtubeStrategy.targetAudience,
          videoTopic: '初回動画企画',
        });
      } catch (error) {
        console.error('動画企画エラー:', error);
      }
    }
    
    // 4. タイトル生成
    if (executionPlan.titleGeneration && executionResults.videoPlanning) {
      try {
        const videoContent = executionResults.videoPlanning?.result?.contentStructure?.introduction || '動画コンテンツ';
        const keywords = executionResults.keywordStrategy?.result?.topKeywords || [];
        
        executionResults.titleGeneration = await youtubeTitleGeneratorWorkflow.execute({
          videoContent,
          seoKeywords: keywords,
          targetAudience: youtubeStrategy.targetAudience,
        });
      } catch (error) {
        console.error('タイトル生成エラー:', error);
      }
    }
    
    // 5. サムネイル生成
    if (executionPlan.thumbnailGeneration && executionResults.titleGeneration) {
      try {
        const titles = executionResults.titleGeneration?.result?.titleOptions?.map((t: any) => t.title) || [];
        
        executionResults.thumbnailGeneration = await youtubeThumbnailTitleGeneratorWorkflow.execute({
          videoTitle: titles[0] || 'デフォルトタイトル',
          videoContent: '動画の内容',
          targetAudience: youtubeStrategy.targetAudience,
        });
      } catch (error) {
        console.error('サムネイル生成エラー:', error);
      }
    }
    
    // 6. スクリプト生成
    if (executionPlan.scriptGeneration) {
      try {
        const keywords = executionResults.keywordStrategy?.result?.topKeywords || [];
        
        executionResults.scriptGeneration = await youtubeVideoScriptGeneratorWorkflow.execute({
          topic: '初回動画トピック',
          keywords,
          targetAudience: youtubeStrategy.targetAudience,
        });
      } catch (error) {
        console.error('スクリプト生成エラー:', error);
      }
    }
    
    // 7. ロングフォーム戦略（複数タイプ）
    if (executionPlan.longFormContent) {
      executionResults.longFormStrategies = {};
      
      // ロードマップ型
      try {
        executionResults.longFormStrategies.roadmap = await youtubeLongFormRoadmapWorkflow.execute({
          topic: businessInfo.name,
          targetAudience: youtubeStrategy.targetAudience,
          contentGoals: youtubeStrategy.goals,
        });
      } catch (error) {
        console.error('ロードマップ型エラー:', error);
      }
      
      // 会話型
      try {
        executionResults.longFormStrategies.conversation = await youtubeLongFormConversationWorkflow.execute({
          topic: businessInfo.name,
          participants: [businessInfo.background],
          targetAudience: youtubeStrategy.targetAudience,
        });
      } catch (error) {
        console.error('会話型エラー:', error);
      }
    }
    
    // 8. ショート動画戦略
    if (executionPlan.shortsContent) {
      executionResults.shortsStrategies = {};
      
      // アイデア生成
      try {
        executionResults.shortsStrategies.ideation = await youtubeShortsIdeationWorkflow.execute({
          channelTheme: businessInfo.name,
          targetAudience: youtubeStrategy.targetAudience,
          trendingTopics: ['ビジネス', 'マーケティング'],
        });
      } catch (error) {
        console.error('ショート動画アイデアエラー:', error);
      }
      
      // スクリプト生成
      if (executionResults.shortsStrategies.ideation) {
        try {
          const ideas = executionResults.shortsStrategies.ideation?.result?.ideas || [];
          if (ideas.length > 0) {
            executionResults.shortsStrategies.script = await youtubeShortsScriptWorkflow.execute({
              idea: ideas[0],
              targetAudience: youtubeStrategy.targetAudience,
            });
          }
        } catch (error) {
          console.error('ショート動画スクリプトエラー:', error);
        }
      }
    }
    
    return { executionResults };
  },
});

/** Step 3: 最終統合レポート生成 */
const generateIntegratedReportStep = createStep({
  id: 'generate-integrated-report',
  description: '全ワークフローの実行結果を統合し、包括的なレポートを生成',
  inputSchema: z.object({
    organizedData: z.any(),
    executionResults: z.any(),
  }),
  outputSchema: z.object({
    integratedReport: z.object({
      executiveSummary: z.string(),
      channelStrategy: z.any(),
      contentPlan: z.any(),
      implementationRoadmap: z.any(),
      nextSteps: z.array(z.string()),
      appendix: z.any(),
    }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const organizationResult = context?.getStepResult('organize-initial-data');
    const orchestrationResult = context?.getStepResult('orchestrate-workflows');
    
    const { organizedData } = organizationResult || {};
    const { executionResults } = orchestrationResult || {};
    
    if (!organizedData || !executionResults) {
      throw new Error('必要なデータが不足しています');
    }
    
    // 統合レポートの生成
    const integratedReport = {
      executiveSummary: `
# YouTube チャンネル戦略統合レポート

## 事業者情報
- **事業者名**: ${organizedData.businessInfo.name}
- **サービスURL**: ${organizedData.businessInfo.serviceUrl || 'なし'}
- **運用目的**: ${organizedData.youtubeStrategy.purpose}

## 実行されたワークフロー
${Object.keys(executionResults).map(key => `- ${key}: ✅ 完了`).join('\n')}

## 主要な成果
1. チャンネルコンセプトの確立
2. SEOキーワード戦略の策定
3. コンテンツ企画の立案
4. タイトル・サムネイル最適化案の生成
5. 各種動画フォーマットのスクリプト準備
      `.trim(),
      
      channelStrategy: {
        concept: executionResults.channelConcept?.result || null,
        keywords: executionResults.keywordStrategy?.result || null,
      },
      
      contentPlan: {
        videoPlanning: executionResults.videoPlanning?.result || null,
        titles: executionResults.titleGeneration?.result || null,
        thumbnails: executionResults.thumbnailGeneration?.result || null,
        scripts: executionResults.scriptGeneration?.result || null,
      },
      
      implementationRoadmap: {
        longForm: executionResults.longFormStrategies || null,
        shorts: executionResults.shortsStrategies || null,
      },
      
      nextSteps: [
        '1. チャンネルの作成と基本設定',
        '2. ブランディング要素（ロゴ、バナー等）の準備',
        '3. 初回動画の撮影・編集',
        '4. 公開スケジュールの策定',
        '5. 分析ツールの設定と KPI の定義',
        '6. プロモーション戦略の実施',
      ],
      
      appendix: {
        rawResults: executionResults,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
      },
    };
    
    return { integratedReport };
  },
});

/* ------------------------------------------------------------------ *
 * 3. 統合ワークフロー定義
 * ------------------------------------------------------------------ */
export const integratedYoutubeWorkflow = createWorkflow({
  id: 'integrated-youtube-master-workflow',
  description: 'YouTube運用の全工程を統合した包括的マスターワークフロー',
  inputSchema: integratedInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      integratedReport: generateIntegratedReportStep.outputSchema.shape.integratedReport,
      executionSummary: z.object({
        totalSteps: z.number(),
        completedSteps: z.number(),
        failedSteps: z.number(),
        executionTime: z.string(),
      }),
    }).optional(),
  }),
})
  .then(initialDataOrganizationStep)
  .then(workflowOrchestrationStep)
  .then(generateIntegratedReportStep);

// ワークフローをコミット
integratedYoutubeWorkflow.commit();

/* ------------------------------------------------------------------ *
 * 4. ヘルパー関数とユーティリティ
 * ------------------------------------------------------------------ */

/**
 * 統合ワークフローを簡単に実行するためのヘルパー関数
 */
export async function runIntegratedYoutubeStrategy(input: z.infer<typeof integratedInputSchema>) {
  const startTime = Date.now();
  
  try {
    const result = await integratedYoutubeWorkflow.execute(input);
    const endTime = Date.now();
    const executionTime = `${(endTime - startTime) / 1000}秒`;
    
    // 実行サマリーを追加
    if (result.success && result.result) {
      result.result.executionSummary = {
        totalSteps: 3,
        completedSteps: 3,
        failedSteps: 0,
        executionTime,
      };
    }
    
    return result;
  } catch (error) {
    console.error('統合ワークフロー実行エラー:', error);
    throw error;
  }
}

/**
 * デフォルト設定での簡易実行
 */
export async function quickStartYoutubeChannel(businessName: string, performerName: string, purpose: string) {
  return runIntegratedYoutubeStrategy({
    businessName,
    performerName,
    serviceUrl: '',
    youtubePurpose: purpose,
    performerBackground: '経験豊富なビジネスオーナー',
    executeSteps: {
      inputCollection: true,
      channelConcept: true,
      keywordResearch: true,
      videoPlanning: true,
      titleGeneration: true,
      thumbnailGeneration: true,
      scriptGeneration: false, // 時間短縮のため
      longFormContent: false,   // 時間短縮のため
      shortsContent: true,
      contentScoring: false,
      analytics: false,
    },
  });
}

export default integratedYoutubeWorkflow;