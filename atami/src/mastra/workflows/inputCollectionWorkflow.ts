// @ts-nocheck - TypeScriptの型チェックを無効化
import { anthropic } from '@ai-sdk/anthropic';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { inputCollectionAgent } from '../agents/inputCollectionAgent';
import { youtubeInputCollectionTool } from '../tools/inputCollection';

const llm = anthropic('claude-3-7-sonnet-20250219');

// ステップ1: 初期インプット収集
const collectInitialInput = createStep({
  id: 'collect-initial-input',
  description: 'Collect basic information for YouTube channel operation',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    presenterName: z.string().describe('Name of the presenter'),
    serviceUrl: z.string().optional().describe('URL of the service (if any)'),
    youtubeGoal: z.string().describe('Goal of YouTube operation (e.g., acquisition, awareness, fan building)'),
    presenterBackground: z.string().describe('Background and history of the presenter'),
  }),
  outputSchema: z.object({
    businessName: z.string(),
    presenterName: z.string(),
    serviceUrl: z.string().optional(),
    youtubeGoal: z.string(),
    presenterBackground: z.string(),
    recommendedWorkflows: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      businessName: string,
      presenterName: string,
      serviceUrl?: string,
      youtubeGoal: string,
      presenterBackground: string,
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await youtubeInputCollectionTool.execute({
      context: {
        businessName: triggerData.businessName,
        presenterName: triggerData.presenterName,
        serviceUrl: triggerData.serviceUrl,
        youtubeGoal: triggerData.youtubeGoal,
        presenterBackground: triggerData.presenterBackground,
      }
    });
  },
});

// ステップ2: ワークフロー推奨
const recommendWorkflows = createStep({
  id: 'recommend-workflows',
  description: 'Recommend appropriate workflows based on collected information',
  inputSchema: z.object({}),
  outputSchema: z.object({
    businessName: z.string(),
    presenterName: z.string(),
    serviceUrl: z.string().optional(),
    youtubeGoal: z.string(),
    presenterBackground: z.string(),
    recommendedWorkflows: z.array(z.string()),
    recommendation: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const inputData = context?.getStepResult(collectInitialInput);

    if (!inputData) {
      throw new Error('Input data not found');
    }

    const prompt = `
    ${inputData.businessName}様、${inputData.presenterName}様のYouTubeチャンネル運用について、
    目的「${inputData.youtubeGoal}」に基づいて、以下のワークフローをおすすめします：
    
    ${inputData.recommendedWorkflows.map((wf, index) => `${index + 1}. ${wf}`).join('\n')}
    
    これらのワークフローを順番に実行することで、効果的なYouTubeチャンネル運用が可能になります。
    どのワークフローから始めたいですか？
    `;

    const response = await inputCollectionAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let recommendationText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      recommendationText += chunk;
    }

    return {
      businessName: inputData.businessName,
      presenterName: inputData.presenterName,
      serviceUrl: inputData.serviceUrl,
      youtubeGoal: inputData.youtubeGoal,
      presenterBackground: inputData.presenterBackground,
      recommendedWorkflows: inputData.recommendedWorkflows,
      recommendation: recommendationText,
    };
  },
});

// ワークフローの説明を取得する関数
function getWorkflowDescription(workflowId) {
  const descriptions = {
    'WORKFLOW-1': 'チャンネルのコンセプト、ターゲットオーディエンス、ポジショニングを設計します。チャンネルの方向性や差別化要素を明確にし、視聴者に一貫したメッセージを伝えるための基盤を作ります。',
    'WORKFLOW-2': '動画のサムネイルとタイトルを最適化し、クリック率を向上させます。視聴者の心理トリガーを活用した複数のバリエーションを生成し、最も効果的な組み合わせを提案します。',
    'WORKFLOW-3': `設計したコンセプトに基づいた具体的な動画企画と検索最適化を行います。

このワークフローでは以下のプロセスを実行します：
1. キーワードリサーチ：ターゲットオーディエンスが検索する関連キーワードを特定
2. 競合分析：同じ領域の人気動画を分析し、差別化ポイントを見つける
3. コンテンツ構造設計：視聴者の興味を引き、維持するための最適な動画構成を設計
4. SEOタイトル・説明文最適化：検索エンジンでの上位表示を狙ったメタデータの作成
5. タグ戦略：関連性の高いタグの選定と優先順位付け
6. 視聴者維持戦略：視聴時間を延ばすためのフック、パターン中断、CTAの配置

最終的に、検索結果で上位表示され、高い視聴維持率を実現する動画企画を提供します。`,
    'WORKFLOW-4': '短尺動画（YouTube Shorts）の企画を生成し、新規視聴者の獲得を促進します。トレンドを活用した注目を集めやすいコンテンツ設計と、メインチャンネルへの誘導戦略を提案します。',
    'WORKFLOW-6': '既存のコンテンツを評価し、改善点を特定します。視聴者維持率、エンゲージメント、コメント分析などの指標に基づいて、コンテンツの強みと弱みを分析し、具体的な改善策を提案します。',
    'WORKFLOW-7': '長尺動画のTAIKI形式での台本を作成します。導入部の強いフック、明確な価値提供、ストーリーテリング要素を組み込んだ、視聴者の興味を最後まで維持する構成の台本を生成します。',
    'WORKFLOW-11': '長尺動画の掛け合い形式での台本を作成します。複数の視点や役割を持つキャラクター間の対話形式で、複雑なトピックを分かりやすく伝える台本を生成します。視聴者の理解を促進し、エンゲージメントを高めます。',
    'WORKFLOW-12': 'YouTubeでの検索上位表示を目指したキーワード戦略を立案します。検索ボリューム、競合度、関連性を分析し、短期・中期・長期的に狙うべきキーワードの優先順位と具体的な活用方法を提案します。',
  };

  return descriptions[workflowId] || 'ワークフローの説明がありません。';
}

// ワークフローの推定所要時間を取得する関数
function getWorkflowEstimatedTime(workflowId) {
  const times = {
    'WORKFLOW-1': '2-3時間',
    'WORKFLOW-2': '1-2時間',
    'WORKFLOW-3': '3-4時間',
    'WORKFLOW-4': '1-2時間',
    'WORKFLOW-6': '2-3時間',
    'WORKFLOW-7': '4-6時間',
    'WORKFLOW-11': '4-6時間',
    'WORKFLOW-12': '2-3時間',
  };

  return times[workflowId] || '不明';
}

// バリデーションステップ
const validateInputCollectionInputStep = createStep({
  id: 'validate-input-collection-input',
  description: 'Validate input for input collection',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    presenterName: z.string().describe('Name of the presenter'),
    serviceUrl: z.string().optional().describe('URL of the service (if any)'),
    youtubeGoal: z.string().describe('Goal of YouTube operation (e.g., acquisition, awareness, fan building)'),
    presenterBackground: z.string().describe('Background and history of the presenter'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      businessName: z.string(),
      presenterName: z.string(),
      serviceUrl: z.string().optional(),
      youtubeGoal: z.string(),
      presenterBackground: z.string(),
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

    if (!input.businessName) {
      return {
        isValid: false,
        message: 'Business name is required',
      };
    }

    if (!input.presenterName) {
      return {
        isValid: false,
        message: 'Presenter name is required',
      };
    }

    if (!input.youtubeGoal) {
      return {
        isValid: false,
        message: 'YouTube goal is required',
      };
    }

    if (!input.presenterBackground) {
      return {
        isValid: false,
        message: 'Presenter background is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

// 新しいワークフロー定義
export const inputCollectionWorkflow = createWorkflow({
  id: 'youtube-input-collection-workflow',
  description: 'Collect initial input for YouTube channel operation',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    presenterName: z.string().describe('Name of the presenter'),
    serviceUrl: z.string().optional().describe('URL of the service (if any)'),
    youtubeGoal: z.string().describe('Goal of YouTube operation (e.g., acquisition, awareness, fan building)'),
    presenterBackground: z.string().describe('Background and history of the presenter'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      businessName: z.string(),
      presenterName: z.string(),
      serviceUrl: z.string().optional(),
      youtubeGoal: z.string(),
      presenterBackground: z.string(),
      recommendedWorkflows: z.array(z.string()),
      recommendation: z.string(),
      executionPlan: z.array(z.object({
        step: z.number(),
        workflowId: z.string(),
        workflowName: z.string(),
        description: z.string(),
        estimatedTime: z.string(),
      })),
      report: z.object({
        title: z.string(),
        date: z.string(),
        clientInfo: z.object({
          businessName: z.string(),
          presenterName: z.string(),
          serviceUrl: z.string().optional(),
          youtubeGoal: z.string(),
          presenterBackground: z.string(),
        }),
        recommendedWorkflows: z.array(z.string()),
        executionPlan: z.array(z.object({
          step: z.number(),
          workflowId: z.string(),
          workflowName: z.string(),
          description: z.string(),
          estimatedTime: z.string(),
        })),
        summary: z.string(),
      }),
    }).optional(),
  }),
})
  .then(validateInputCollectionInputStep)
  .then(collectInitialInput)
  .then(recommendWorkflows);

// ワークフローをコミット
inputCollectionWorkflow.commit();