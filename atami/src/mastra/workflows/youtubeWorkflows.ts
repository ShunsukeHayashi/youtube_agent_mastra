// シンプルなワークフロー実装
import { z } from 'zod';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import fs from 'fs';
import path from 'path';

// LLMの設定
const llm = anthropic('claude-3-7-sonnet-20250219');

// プロンプトファイルの読み込み関数
function loadPromptFile(filePath: string): string {
  try {
    // 相対パスを絶対パスに変換
    const fullPath = path.resolve(process.cwd(), filePath);
    console.log(`Loading prompt file from: ${fullPath}`);

    // ファイルが存在するか確認
    if (!fs.existsSync(fullPath)) {
      console.error(`Prompt file not found: ${fullPath}`);
      throw new Error(`File not found: ${fullPath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content) {
      throw new Error('Empty prompt file');
    }
    return content;
  } catch (error) {
    console.error(`Error loading prompt file: ${error}`);
    // デフォルトの指示を返す
    return 'You are a YouTube strategy expert. Help users create effective YouTube content strategies.';
  }
}

// メモリの設定
const agentMemory = new Memory({
  storage: new LibSQLStore({
    url: 'file:../mastra.db', // path is relative to the .mastra/output directory
  }),
  options: {
    lastMessages: 10,
    semanticRecall: false,
    threads: {
      generateTitle: false,
    },
  },
});

// チャンネルコンセプト設計エージェント
const channelConceptDesignAgent = new Agent({
  name: 'YouTube Channel Concept Designer',
  instructions: 'You are a YouTube channel concept designer. Your task is to analyze business information and create strategic YouTube channel concept proposals that align with the business goals and target audience.',
  model: llm,
  memory: agentMemory,
});

// キーワード戦略シミュレーションエージェント
const keywordStrategyAgent = new Agent({
  name: 'YouTube Keyword Strategy Simulator',
  instructions: 'You are a YouTube keyword strategy expert. Your task is to analyze business information and create strategic keyword recommendations that will help the YouTube channel reach its target audience and achieve its business goals.',
  model: llm,
  memory: agentMemory,
});

// ========== チャンネルコンセプト設計ワークフロー ==========

// チャンネルコンセプト設計ステップ
const generateChannelConceptStep = createStep({
  id: 'generate-channel-concept',
  description: 'Generate strategic YouTube channel concept proposals based on business information',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel (e.g., lead acquisition, brand awareness)'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    channelConceptProposals: z.string(),
  }),
  execute: async (params) => {
    console.log('チャンネルコンセプト設計ステップが実行されました');

    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const triggerData = context?.getStepResult('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    console.log('入力:', triggerData);

    // プロンプトの作成
    const prompt = `
    # チャンネルコンセプト設計
    
    ## 商品情報
    ${triggerData.productInfo}
    
    ## ターゲット属性
    ${triggerData.targetAudience}
    
    ${triggerData.serviceUrl ? `## サービスURL\n${triggerData.serviceUrl}` : ''}
    ${triggerData.businessGoals ? `## ビジネス目標\n${triggerData.businessGoals}` : ''}
    ${triggerData.competitorChannels ? `## 競合チャンネル\n${triggerData.competitorChannels.join('\n')}` : ''}
    ${triggerData.industryCategory ? `## 業界カテゴリ\n${triggerData.industryCategory}` : ''}
    ${triggerData.brandGuidelines ? `## ブランドガイドライン\n${triggerData.brandGuidelines}` : ''}
    
    上記の情報を分析し、効果的なYouTubeチャンネルのコンセプト案を30件生成してください。
    `;

    // エージェントを使用して結果を生成
    const response = await channelConceptDesignAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let conceptText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      conceptText += chunk;
    }

    return {
      channelConceptProposals: conceptText || 'これはダミーのチャンネルコンセプト提案です。実際の実装では、AIを使用して生成します。'
    };
  },
});

// バリデーションステップ（チャンネルコンセプト）
const validateChannelConceptInputStep = createStep({
  id: 'validate-channel-concept-input',
  description: 'Validate input for channel concept generation',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      productInfo: z.string(),
      targetAudience: z.string(),
      serviceUrl: z.string().optional(),
      businessGoals: z.string().optional(),
      competitorChannels: z.array(z.string()).optional(),
      industryCategory: z.string().optional(),
      brandGuidelines: z.string().optional(),
    }).optional(),
  }),
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const input = context?.getStepResult('trigger');

    if (!input) {
      return {
        isValid: false,
        message: 'Input data not found',
      };
    }

    if (!input.productInfo) {
      return {
        isValid: false,
        message: 'Product information is required',
      };
    }

    if (!input.targetAudience) {
      return {
        isValid: false,
        message: 'Target audience is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

// チャンネルコンセプト設計ワークフロー
const youtubeChannelConceptDesignWorkflow = createWorkflow({
  id: 'youtube-channel-concept-design-workflow',
  description: 'Generate strategic YouTube channel concept proposals based on business information',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel (e.g., lead acquisition, brand awareness)'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      channelConceptProposals: z.string(),
    }).optional(),
  }),
})
  .then(validateChannelConceptInputStep)
  .then(generateChannelConceptStep);

// ワークフローをコミット
youtubeChannelConceptDesignWorkflow.commit();

// ========== キーワード戦略シミュレーションワークフロー ==========

// キーワード戦略シミュレーションステップ
const generateKeywordStrategyStep = createStep({
  id: 'generate-keyword-strategy',
  description: 'Generate YouTube keyword strategy simulation based on business information',
  inputSchema: z.object({
    company_url: z.string().describe('URL of the company or service website'),
    target_audience: z.string().describe('Description of the target audience'),
    youtube_purpose: z.string().describe('Purpose of the YouTube channel'),
    ng_keywords: z.string().optional().describe('Keywords to avoid'),
    preferred_topics: z.string().optional().describe('Preferred topics to focus on'),
  }),
  outputSchema: z.object({
    keywordStrategy: z.string(),
  }),
  execute: async (params) => {
    console.log('キーワード戦略シミュレーションステップが実行されました');

    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const triggerData = context?.getStepResult('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    console.log('入力:', triggerData);

    // プロンプトの作成
    const prompt = `
    # YouTubeキーワード戦略シミュレーション
    
    ## 企業/サービスURL
    ${triggerData.company_url}
    
    ## ターゲット顧客
    ${triggerData.target_audience}
    
    ## YouTube運用の目的
    ${triggerData.youtube_purpose}
    
    ${triggerData.ng_keywords ? `## NGキーワード・トピック\n${triggerData.ng_keywords}` : ''}
    ${triggerData.preferred_topics ? `## 発信したいテーマ・トピック\n${triggerData.preferred_topics}` : ''}
    
    上記の情報を分析し、YouTubeチャンネル運用のための最適なキーワード戦略を提案してください。
    `;

    // エージェントを使用して結果を生成
    const response = await keywordStrategyAgent.stream([
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
      keywordStrategy: strategyText || 'これはダミーのキーワード戦略です。実際の実装では、AIを使用して生成します。'
    };
  },
});

// バリデーションステップ（キーワード戦略）
const validateKeywordStrategyInputStep = createStep({
  id: 'validate-keyword-strategy-input',
  description: 'Validate input for keyword strategy generation',
  inputSchema: z.object({
    company_url: z.string().describe('URL of the company or service website'),
    target_audience: z.string().describe('Description of the target audience'),
    youtube_purpose: z.string().describe('Purpose of the YouTube channel'),
    ng_keywords: z.string().optional().describe('Keywords to avoid'),
    preferred_topics: z.string().optional().describe('Preferred topics to focus on'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      company_url: z.string(),
      target_audience: z.string(),
      youtube_purpose: z.string(),
      ng_keywords: z.string().optional(),
      preferred_topics: z.string().optional(),
    }).optional(),
  }),
  execute: async (params) => {
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const context = params.context;
    // @ts-ignore - TypeScript型定義の問題を一時的に無視
    const input = context?.getStepResult('trigger');

    if (!input) {
      return {
        isValid: false,
        message: 'Input data not found',
      };
    }

    if (!input.company_url) {
      return {
        isValid: false,
        message: 'Company URL is required',
      };
    }

    if (!input.target_audience) {
      return {
        isValid: false,
        message: 'Target audience is required',
      };
    }

    if (!input.youtube_purpose) {
      return {
        isValid: false,
        message: 'YouTube purpose is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

// キーワード戦略シミュレーションワークフロー
const youtubeKeywordStrategyWorkflow = createWorkflow({
  id: 'youtube-keyword-strategy-workflow',
  description: 'Generate YouTube keyword strategy simulation based on business information',
  inputSchema: z.object({
    company_url: z.string().describe('URL of the company or service website'),
    target_audience: z.string().describe('Description of the target audience'),
    youtube_purpose: z.string().describe('Purpose of the YouTube channel'),
    ng_keywords: z.string().optional().describe('Keywords to avoid'),
    preferred_topics: z.string().optional().describe('Preferred topics to focus on'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      keywordStrategy: z.string(),
    }).optional(),
  }),
})
  .then(validateKeywordStrategyInputStep)
  .then(generateKeywordStrategyStep);

// ワークフローをコミット
youtubeKeywordStrategyWorkflow.commit();

// ワークフローをエクスポート
export { youtubeChannelConceptDesignWorkflow, youtubeKeywordStrategyWorkflow };
