/**
 * YouTube入力収集ツール
 *
 * YouTubeチャンネル運用のための初期インプットを収集し、
 * 目的に応じた最適なワークフローを推奨します。
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * ワークフロー定義
 * ID、名前、説明を含む
 */
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
}

/**
 * 利用可能なワークフロー定義
 */
const WORKFLOWS: Record<string, WorkflowDefinition> = {
  CHANNEL_CONCEPT: {
    id: 'WORKFLOW-1',
    name: 'Channel Concept Design',
    description: 'チャンネルコンセプト設計'
  },
  VIDEO_MARKETING: {
    id: 'WORKFLOW-2',
    name: 'YouTube動画マーケティング支援',
    description: 'サムネイルとタイトルの生成'
  },
  VIDEO_PLANNING: {
    id: 'WORKFLOW-3',
    name: '動画企画生成＆SEO最適化',
    description: '動画の企画とSEO最適化'
  },
  SHORTS_PLANNING: {
    id: 'WORKFLOW-4',
    name: 'YouTube Shorts企画生成',
    description: 'Shorts向けの企画生成'
  },
  SHORTS_SCRIPT: {
    id: 'WORKFLOW-5',
    name: 'Shorts台本リサーチ＆生成',
    description: 'Shorts向けの台本作成'
  },
  CONTENT_SCORING: {
    id: 'WORKFLOW-6',
    name: 'コンテンツスコアリング＆フィードバック',
    description: 'コンテンツの評価とフィードバック'
  },
  LONG_FORM_TAIKI: {
    id: 'WORKFLOW-7',
    name: '長尺TAIKI',
    description: '長尺コンテンツのTAIKI形式'
  },
  LONG_FORM_ROADMAP: {
    id: 'WORKFLOW-8',
    name: '長尺ロードマップ',
    description: '長尺コンテンツのロードマップ'
  },
  LONG_FORM_OSARU: {
    id: 'WORKFLOW-9',
    name: '長尺おさる',
    description: '長尺コンテンツのおさる形式'
  },
  LONG_FORM_MOEZOU: {
    id: 'WORKFLOW-10',
    name: '長尺もえぞう',
    description: '長尺コンテンツのもえぞう形式'
  },
  LONG_FORM_DIALOGUE: {
    id: 'WORKFLOW-11',
    name: '長尺掛け合い',
    description: '長尺コンテンツの掛け合い形式'
  },
  KEYWORD_STRATEGY: {
    id: 'WORKFLOW-12',
    name: 'YouTubeキーワード戦略シミュレーション',
    description: 'キーワード戦略のシミュレーション'
  },
  INPUT_COLLECTION: {
    id: 'WORKFLOW-13',
    name: 'プロジェクト初期インプット収集',
    description: '基本情報の収集と整理'
  }
};

/**
 * 入力データの型定義
 */
interface InputCollectionData {
  businessName?: string;
  presenterName?: string;
  serviceUrl?: string;
  youtubeGoal?: string;
  presenterBackground?: string;
}

/**
 * 出力データの型定義
 */
interface OutputCollectionData extends InputCollectionData {
  recommendedWorkflows: string[];
}

export const youtubeInputCollectionTool = createTool({
  id: 'youtube-input-collection',
  description: 'Collect initial input for YouTube channel operation',
  inputSchema: z.object({
    businessName: z.string().optional().describe('Name of the business or organization'),
    presenterName: z.string().optional().describe('Name of the person appearing in the YouTube channel'),
    serviceUrl: z.string().url().optional().describe('URL of related website or service'),
    youtubeGoal: z.string().optional().describe('Purpose of YouTube operation (e.g., customer acquisition, awareness expansion, fan creation)'),
    presenterBackground: z.string().optional().describe('Background and history of the presenter, including career, expertise, skills, etc.'),
  }),
  outputSchema: z.object({
    businessName: z.string().optional(),
    presenterName: z.string().optional(),
    serviceUrl: z.string().url().optional(),
    youtubeGoal: z.string().optional(),
    presenterBackground: z.string().optional(),
    recommendedWorkflows: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    try {
      console.log('Collecting input for YouTube channel operation');
      console.log(`Input data: ${JSON.stringify(context)}`);
      
      // 目的に応じたワークフローを推奨
      const recommendedWorkflows = getRecommendedWorkflows(context);
      
      // テストファイルに合わせて、contextをそのまま返し、recommendedWorkflowsを追加
      const result: OutputCollectionData = {
        ...context,
        recommendedWorkflows
      };
      
      console.log(`Recommended workflows: ${recommendedWorkflows.length}`);
      return result;
    } catch (error) {
      console.error('Error in input collection tool:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`入力収集中にエラーが発生しました: ${errorMessage}`);
    }
  },
});

/**
 * 目的に応じたワークフローを推奨する関数
 * @param context 入力データ
 * @returns 推奨ワークフローのリスト
 */
function getRecommendedWorkflows(context: InputCollectionData): string[] {
  // 基本的に常に含めるワークフロー
  const recommendedWorkflows = [`${WORKFLOWS.CHANNEL_CONCEPT.id}: ${WORKFLOWS.CHANNEL_CONCEPT.name}`];
  
  if (context.youtubeGoal) {
    const goal = context.youtubeGoal.toLowerCase();
    
    // 認知拡大関連
    if (goal === '認知拡大' || goal.includes('認知')) {
      recommendedWorkflows.push(`${WORKFLOWS.VIDEO_PLANNING.id}: ${WORKFLOWS.VIDEO_PLANNING.name}`);
      recommendedWorkflows.push(`${WORKFLOWS.VIDEO_MARKETING.id}: ${WORKFLOWS.VIDEO_MARKETING.name}`);
    }
    
    // 集客関連
    if (goal === '集客' || goal.includes('集客')) {
      recommendedWorkflows.push(`${WORKFLOWS.KEYWORD_STRATEGY.id}: ${WORKFLOWS.KEYWORD_STRATEGY.name}`);
      recommendedWorkflows.push(`${WORKFLOWS.SHORTS_PLANNING.id}: ${WORKFLOWS.SHORTS_PLANNING.name}`);
    }
    
    // ファン化関連
    if (goal === 'ファン化' || goal.includes('ファン')) {
      recommendedWorkflows.push(`${WORKFLOWS.LONG_FORM_TAIKI.id}: ${WORKFLOWS.LONG_FORM_TAIKI.name}`);
      recommendedWorkflows.push(`${WORKFLOWS.LONG_FORM_DIALOGUE.id}: ${WORKFLOWS.LONG_FORM_DIALOGUE.name}`);
    }
    
    // エンゲージメント関連
    if (goal.includes('エンゲージ') || goal.includes('コミュニティ')) {
      recommendedWorkflows.push(`${WORKFLOWS.SHORTS_SCRIPT.id}: ${WORKFLOWS.SHORTS_SCRIPT.name}`);
      recommendedWorkflows.push(`${WORKFLOWS.LONG_FORM_DIALOGUE.id}: ${WORKFLOWS.LONG_FORM_DIALOGUE.name}`);
    }
    
    // 教育・情報提供関連
    if (goal.includes('教育') || goal.includes('情報')) {
      recommendedWorkflows.push(`${WORKFLOWS.LONG_FORM_ROADMAP.id}: ${WORKFLOWS.LONG_FORM_ROADMAP.name}`);
      recommendedWorkflows.push(`${WORKFLOWS.LONG_FORM_OSARU.id}: ${WORKFLOWS.LONG_FORM_OSARU.name}`);
    }
  }
  
  // 常に含めるワークフロー
  recommendedWorkflows.push(`${WORKFLOWS.CONTENT_SCORING.id}: ${WORKFLOWS.CONTENT_SCORING.name}`);
  
  // 重複を排除して返す
  return [...new Set(recommendedWorkflows)];
}