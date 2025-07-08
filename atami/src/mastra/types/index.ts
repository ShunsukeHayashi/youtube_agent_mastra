/**
 * 共通型定義ファイル
 * Mastraフレームワークで使用する型定義や、プロジェクト全体で共通して使用する型を定義します。
 */

import { z } from 'zod';

/**
 * Mastraフレームワークのステップコンテキスト型
 */
export interface StepContext {
  getStepResult: <T>(step: any) => T | null;
}

/**
 * Mastraフレームワークのランタイムコンテキスト型
 */
export interface RuntimeContext {
  [key: string]: any;
}

/**
 * Mastraフレームワークのステップ実行パラメータ型
 */
export interface StepExecuteParams {
  context: StepContext;
  runtimeContext: RuntimeContext;
  mastra?: any;
}

/**
 * YouTube分析関連の型定義
 */

// チャンネル分析データの型
export interface ChannelAnalytics {
  rows: Record<string, string | number>[];
  summary: {
    totalViews?: number;
    avgViewDuration?: number;
    totalWatchTime?: number;
    avgCtr?: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// 動画分析データの型
export interface VideoAnalytics {
  videoId: string;
  rows: Record<string, string | number>[];
  summary: {
    totalViews?: number;
    avgViewDuration?: number;
    totalWatchTime?: number;
    retentionRate?: number;
    ctr?: number;
    subscribersGained?: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// 視聴者属性データの型
export interface AudienceData {
  dimensionType: string;
  rows: {
    dimension: string;
    percentage: number;
  }[];
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

/**
 * タイトル生成関連の型定義
 */

// YouTubeペルソナの型
export interface YouTubePersona {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  viewingHabits: string;
}

// サムネイルテキストの型
export interface ThumbnailText {
  text: string;
  rating: number;
  rationale: string;
  personaReactions: {
    personaName: string;
    reaction: string;
  }[];
}

// タイトルオプションの型
export interface TitleOption {
  title: string;
  rating: number;
  rationale: string;
  thumbnailTextId: number;
  seoKeywords: string[];
}

// タイトルとサムネイルのセットの型
export interface TitleAndThumbnailSet {
  thumbnailText: string;
  titles: string[];
}

// 動画説明文の型
export interface VideoDescriptionSet {
  description: string;
  tags: string[];
}

/**
 * 動画企画関連の型定義
 */

// キーワードデータの型
export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: string;
  relevance: number;
  rank: number;
}

// 競合動画の型
export interface CompetitorVideo {
  title: string;
  channelName: string;
  views: number;
  likes: number;
  comments: number;
  publishDate: string;
  duration: string;
  engagementRate: number;
  url: string;
  strengths: string[];
  weaknesses: string[];
}

// コンテンツ構造の型
export interface ContentStructure {
  section: string;
  duration: string;
  purpose: string;
  description: string;
}

// 動画タグの型
export interface VideoTag {
  tag: string;
  relevance: number;
  searchVolume: number;
  competition: string;
}

// 視聴者維持戦略の型
export interface AudienceRetentionStrategy {
  technique: string;
  implementation: string;
  expectedImpact: string;
  timeMarker: string;
}

/**
 * 入力スキーマの型定義
 */

// チャンネル分析の入力スキーマ
export const channelAnalyticsInputSchema = z.object({
  channelId: z.string().describe('取得対象のチャンネル ID'),
  startDate: z
    .string()
    .describe('YYYY-MM-DD 形式。デフォルト: 30日前')
    .optional(),
  endDate: z
    .string()
    .describe('YYYY-MM-DD 形式。デフォルト: 今日')
    .optional(),
  metrics: z
    .array(z.string())
    .describe('取得する指標のリスト')
    .optional(),
  dimensions: z.string().describe('分析単位 (day/month など)').optional(),
});

// 動画分析の入力スキーマ
export const videoAnalyticsInputSchema = z.object({
  channelId: z.string().describe('チャンネル ID'),
  videoId: z.string().describe('分析対象の動画 ID'),
  startDate: z
    .string()
    .describe('YYYY-MM-DD 形式。デフォルト: 動画公開から30日')
    .optional(),
  endDate: z
    .string()
    .describe('YYYY-MM-DD 形式。デフォルト: 今日')
    .optional(),
  metrics: z
    .array(z.string())
    .describe('取得する指標のリスト')
    .optional(),
});

// タイトル生成の入力スキーマ
export const titleGeneratorInputSchema = z.object({
  videoContent: z.string().describe('The content/transcript of the video'),
  seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
  targetAudience: z.string().optional().describe('Description of the target audience'),
  videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
  channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
});

// サムネイルタイトル生成の入力スキーマ
export const thumbnailTitleGeneratorInputSchema = z.object({
  videoContent: z.string().describe('The content summary or full script of the video'),
  seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
  targetAudience: z.string().optional().describe('Description of the target audience'),
  videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
  channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
  scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
});

// 動画企画の入力スキーマ
export const videoPlanningInputSchema = z.object({
  channelConcept: z.string().describe('The concept of the YouTube channel'),
  targetAudience: z.string().describe('Description of the target audience'),
  videoTopic: z.string().describe('The main topic of the video'),
  existingKeywords: z.array(z.string()).optional().describe('Existing SEO keywords to include'),
  competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
  videoDuration: z.string().optional().describe('Expected duration of the video (e.g., "5-10 minutes", "15-20 minutes")'),
  contentGoal: z.string().optional().describe('Primary goal of the content (e.g., "educate", "entertain", "convert")'),
  channelConceptSource: z.enum(['WORKFLOW-1', 'direct']).optional().describe('Source of the channel concept (WORKFLOW-1 or directly provided)'),
});