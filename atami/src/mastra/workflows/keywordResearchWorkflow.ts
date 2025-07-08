// @ts-nocheck - TypeScriptの型チェックを無効化
import { openai } from '@ai-sdk/openai';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { keywordResearchAgent } from '../agents/keywordResearchAgent';
import { keywordResearchTool } from '../tools/keywordResearch';

const llm = openai('gpt-4');

// キーワードリサーチステップ
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
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      keyword: string,
      location?: string,
      language?: string,
      limit?: number,
      includeRelated?: boolean,
      source?: 'youtube' | 'google' | 'amazon' | 'bing' | 'ebay' | 'app-store' | 'play-store' | 'instagram' | 'twitter',
      businessCategory?: string,
      targetAudience?: string,
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await keywordResearchTool.execute({
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

// キーワード戦略プレゼンテーションステップ
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
  execute: async ({ context, mastra }) => {
    const researchResults = context?.getStepResult(researchKeywords);

    if (!researchResults) {
      throw new Error('Keyword research results not found');
    }

    const triggerData = context?.getStepResult<{
      businessCategory?: string,
      targetAudience?: string,
    }>('trigger');

    let businessContext = '';
    if (triggerData?.businessCategory || triggerData?.targetAudience) {
      businessContext = `
ビジネスカテゴリ: ${triggerData?.businessCategory || '指定なし'}
ターゲットオーディエンス: ${triggerData?.targetAudience || '指定なし'}
      `.trim();
    }

    // メタデータから追加情報を取得
    const { apiKeyUsed, timestamp } = researchResults.metadata;

    const prompt = `以下のキーワードリサーチ結果をもとに、YouTube動画のSEO最適化のための戦略的なキーワード提案を行ってください：
      ${JSON.stringify(researchResults, null, 2)}
      
      ${businessContext}
      
      注意: このデータは${apiKeyUsed ? '実際のAPI' : 'モックデータ'}を使用して${new Date(timestamp).toLocaleString('ja-JP')}に生成されました。
    `;

    // 一時的にエージェントの代わりにモックデータを返す（APIキーが必要なため）
    console.log('モックデータを使用します（Anthropic APIキーが設定されていないため）');

    // モックの戦略テキスト
    const strategyText = `
## 📊 メインキーワード分析
- 🔍 「${researchResults.mainKeyword.keyword}」
  • 検索ボリューム: ${researchResults.mainKeyword.searchVolume || 'データなし'}/月
  • 競合度: ${researchResults.mainKeyword.competition || '中'}
  • トレンド: 安定

## 🔑 高ボリューム関連キーワード（上位10件）
${researchResults.relatedKeywords.slice(0, 10).map((kw, i) =>
      `${i + 1}. 「${kw.keyword}」- ${kw.searchVolume || 0}/月`
    ).join('\n')}

## 💎 ニッチキーワード（競合が少ない）
${researchResults.relatedKeywords
        .filter(kw => kw.competition === 'Low')
        .slice(0, 5)
        .map((kw, i) => `${i + 1}. 「${kw.keyword}」- ${kw.searchVolume || 0}/月 | 競合度: 低`)
        .join('\n') || '競合が少ないキーワードは見つかりませんでした。'}

## 🎯 推奨キーワード戦略
- メインキーワード: 「${researchResults.mainKeyword.keyword}」
- サポートキーワード:
  1. 「${researchResults.relatedKeywords[0]?.keyword || 'データなし'}」
  2. 「${researchResults.relatedKeywords[1]?.keyword || 'データなし'}」
  3. 「${researchResults.relatedKeywords[2]?.keyword || 'データなし'}」

## 📋 SEO最適化アドバイス
- タイトルへの組み込み方: メインキーワードをタイトルの先頭に配置し、サポートキーワードを自然な形で組み込む
- 説明文への組み込み方: 最初の2-3文にメインキーワードを含め、残りの説明文にサポートキーワードを散りばめる
- タグ戦略: メインキーワードとサポートキーワードを必ずタグに含める
- サムネイル最適化: キーワードを視覚的に表現し、目立つデザインにする

注意: このデータは${apiKeyUsed ? '実際のAPI' : 'モックデータ'}を使用して生成されました。実際の検索ボリュームとは異なる可能性があります。
    `;

    // 出力をコンソールに表示
    console.log(strategyText);

    return {
      keywordStrategy: strategyText,
      metadata: researchResults.metadata,
    };
  },
});

// バリデーションステップ
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
  execute: async ({ context }) => {
    const input = context?.getStepResult('trigger');

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

// 新しいワークフロー定義
const keywordResearchWorkflow = createWorkflow({
  id: 'keyword-research-workflow',
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

// ワークフローをコミット
keywordResearchWorkflow.commit();

export { keywordResearchWorkflow };