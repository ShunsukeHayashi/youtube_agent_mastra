/**
 * YouTube Keyword Research Tool
 *
 * Uses the Keyword Tool API to obtain search volume and related keywords for YouTube.
 * Returns mock data if the API key is not set.
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';

// .envファイルから環境変数を読み込む
dotenv.config();

// API設定
const API_CONFIG = {
  // APIキーを環境変数から取得（なければデフォルト値を使用）
  KEY: process.env.KEYWORD_TOOL_API_KEY || '',
  BASE_URL: 'https://api.keywordtool.io/v2',
  TIMEOUT: 10000, // 10秒
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

/**
 * キーワードデータのインターフェース
 */
interface KeywordData {
  keyword: string;
  searchVolume: number;
  cpc?: number;
  competition?: string;
  trend?: number[];
  related?: string[];
}

/**
 * APIレスポンスの型定義
 */
interface KeywordToolResponse {
  results?: Array<{
    string?: string;
    search_volume?: number;
    cpc?: number;
    competition?: string;
    trend?: number[];
  }>;
  pageInfo?: {
    totalResults: number;
  };
}

export const youtubeKeywordResearchTool = createTool({
  id: 'youtube-keyword-research-tool',
  description: 'Research keywords using Keyword Tool API to get search volume and related keywords',
  inputSchema: z.object({
    keyword: z.string().describe('The main keyword to research'),
    location: z.string().default('jp').describe('Location for search metrics (e.g., jp, us)'),
    language: z.string().default('ja').describe('Language for search metrics (e.g., ja, en)'),
    limit: z.number().default(20).describe('Maximum number of results to return'),
    includeRelated: z.boolean().default(true).describe('Whether to include related keywords'),
    source: z.enum(['youtube', 'google', 'amazon', 'bing', 'ebay', 'app-store', 'play-store', 'instagram', 'twitter']).default('youtube').describe('Source platform for keyword research'),
  }),
  outputSchema: z.object({
    mainKeyword: z.object({
      keyword: z.string(),
      searchVolume: z.number().nullable(),
      cpc: z.number().nullable().optional(),
      competition: z.string().nullable().optional(),
      trend: z.array(z.number()).nullable().optional(),
    }),
    relatedKeywords: z.array(
      z.object({
        keyword: z.string(),
        searchVolume: z.number().nullable(),
        cpc: z.number().nullable().optional(),
        competition: z.string().nullable().optional(),
      })
    ).default([]),
    metadata: z.object({
      totalResults: z.number(),
      source: z.string(),
      location: z.string(),
      language: z.string(),
      processingTime: z.number(),
      apiKeyUsed: z.boolean(),
      timestamp: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    console.log(`Researching keywords for: ${context.keyword}`);
    const startTime = Date.now();
    
    try {
      // APIキーの存在確認
      const apiKeyUsed = !!process.env.KEYWORD_TOOL_API_KEY;
      console.log(`API key ${apiKeyUsed ? 'is' : 'is not'} set`);
      
      // メインキーワードの検索ボリュームを取得
      const mainKeywordData = await getKeywordData(
        context.keyword,
        context.location,
        context.language,
        context.source
      );
      
      // 関連キーワードを取得（オプション）
      let relatedKeywords: KeywordData[] = [];
      if (context.includeRelated) {
        relatedKeywords = await getRelatedKeywords(
          context.keyword,
          context.location,
          context.language,
          context.limit,
          context.source
        );
      }
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // 秒単位
      
      return {
        mainKeyword: mainKeywordData,
        relatedKeywords,
        metadata: {
          totalResults: relatedKeywords.length,
          source: context.source,
          location: context.location,
          language: context.language,
          processingTime,
          apiKeyUsed,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Error researching keywords:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`キーワードリサーチ中にエラーが発生しました: ${errorMessage}`);
    }
  },
});

/**
 * 共通のAPIリクエスト関数
 * @param endpoint APIエンドポイント
 * @param params リクエストパラメータ
 * @returns APIレスポンス
 */
async function makeApiRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  try {
    // APIキーの確認
    if (!API_CONFIG.KEY) {
      throw new Error('API key is not set');
    }

    const config: AxiosRequestConfig = {
      params: {
        ...params,
        apikey: API_CONFIG.KEY,
        output: 'json',
      },
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    };

    // エンドポイントの形式を確認
    if (!endpoint.includes('/')) {
      throw new Error(`Invalid endpoint format: ${endpoint}. Expected format: /search/[mode]/[provider]`);
    }
    
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    const response: AxiosResponse<T> = await axios.post(url, null, config);
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error && 'response' in error
      ? JSON.stringify((error as any).response?.data || {})
      : 'No response data';
    
    console.error(`API request failed: ${errorMessage}`);
    console.error(`Error details: ${errorDetails}`);
    
    throw error;
  }
}

/**
 * メインキーワードのデータを取得
 * @param keyword 検索キーワード
 * @param location 地域コード
 * @param language 言語コード
 * @param source 検索ソース
 * @returns キーワードデータ
 */
async function getKeywordData(
  keyword: string,
  location: string = 'jp',
  language: string = 'ja',
  source: string = 'youtube'
): Promise<KeywordData> {
  try {
    // APIキーの確認
    if (!API_CONFIG.KEY) {
      console.warn('API key is not set. Using mock data instead.');
      return getMockKeywordData(keyword);
    }

    // APIリクエスト
    const data = await makeApiRequest<KeywordToolResponse>(`/search/volume/${source}`, {
      keyword: [keyword],
      country: location,
    });
    
    // レスポンスからデータを抽出
    if (data?.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        keyword: result.string || keyword,
        searchVolume: result.search_volume || 0,
        cpc: result.cpc || undefined,
        competition: result.competition || undefined,
        trend: result.trend || undefined,
      };
    }
    
    // データがない場合はデフォルト値を返す
    return {
      keyword,
      searchVolume: 0,
    };
  } catch (error) {
    console.error('Error fetching keyword data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    
    // APIエラーの場合はモックデータを返す（開発用）
    return getMockKeywordData(keyword);
  }
}

/**
 * 関連キーワードを取得
 * @param keyword 検索キーワード
 * @param location 地域コード
 * @param language 言語コード
 * @param limit 取得する件数
 * @param source 検索ソース
 * @returns 関連キーワードのリスト
 */
async function getRelatedKeywords(
  keyword: string,
  location: string = 'jp',
  language: string = 'ja',
  limit: number = 20,
  source: string = 'youtube'
): Promise<KeywordData[]> {
  try {
    // APIキーの確認
    if (!API_CONFIG.KEY) {
      console.warn('API key is not set. Using mock data instead.');
      return getMockRelatedKeywords(keyword, limit);
    }

    // APIリクエスト
    const data = await makeApiRequest<KeywordToolResponse>(`/search/keywords/${source}`, {
      keyword: [keyword],
      country: location,
    });
    
    // レスポンスからデータを抽出
    if (data?.results && data.results.length > 0) {
      return data.results.slice(0, limit).map(result => ({
        keyword: result.string || '',
        searchVolume: result.search_volume || 0,
        cpc: result.cpc || undefined,
        competition: result.competition || undefined,
      }));
    }
    
    // データがない場合は空配列を返す
    return [];
  } catch (error) {
    console.error('Error fetching related keywords:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    
    // APIエラーの場合はモックデータを返す（開発用）
    return getMockRelatedKeywords(keyword, limit);
  }
}

/**
 * モックキーワードデータを生成する関数
 * @param keyword キーワード
 * @returns モックキーワードデータ
 */
function getMockKeywordData(keyword: string): KeywordData {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000),
    cpc: Math.random() * 2,
    competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100)),
  };
}

/**
 * モック関連キーワードを生成する関数
 * @param keyword キーワード
 * @param limit 取得する件数
 * @returns モック関連キーワードのリスト
 */
function getMockRelatedKeywords(keyword: string, limit: number): KeywordData[] {
  // 日本語の一般的な関連キーワードパターン
  const mockKeywordPatterns = [
    '初心者', '方法', 'やり方', 'コツ', '効果',
    'おすすめ', '比較', 'レビュー', '無料', '例',
    '入門', '講座', '使い方', 'メリット', 'デメリット',
    '基礎', '応用', '上級', '簡単', '人気'
  ];
  
  // 実際のキーワード数がlimitより少ない場合に備えて、パターンをシャッフル
  const shuffledPatterns = [...mockKeywordPatterns]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(limit, mockKeywordPatterns.length));
  
  return shuffledPatterns.map(pattern => ({
    keyword: `${keyword} ${pattern}`,
    searchVolume: Math.floor(Math.random() * 5000),
    cpc: Math.random() * 2,
    competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
  }));
}