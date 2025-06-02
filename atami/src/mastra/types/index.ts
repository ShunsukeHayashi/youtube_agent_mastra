/**
 * Common type definitions for the Mastra YouTube Agent project
 */

import { z } from 'zod';
export * from './stepTypes';

/**
 * Mastra framework step context type
 */
export interface StepContext {
  getStepResult: <T>(step: any) => T | null;
}

/**
 * Mastra framework runtime context type
 */
export interface RuntimeContext {
  [key: string]: any;
}

/**
 * Mastra framework step execution parameters type
 */
export interface StepExecuteParams {
  context: StepContext;
  runtimeContext: RuntimeContext;
  mastra?: any;
}

/**
 * Workflow orchestration type definitions
 */

export interface WorkflowChainConfig {
  id: string;
  description: string;
  workflows: Array<{
    workflow: any;
    inputMapping?: Record<string, string>;
    outputMapping?: Record<string, string>;
    optional?: boolean;
    condition?: (data: any) => boolean;
    parallel?: boolean;
  }>;
}

export type ChainStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

export interface WorkflowExecutionStatus {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
}

export interface ChainExecutionState {
  chainId: string;
  status: ChainStatus;
  currentStepIndex: number;
  startTime: string;
  lastUpdateTime: string;
  endTime?: string;
  contextData: any;
  results: WorkflowExecutionStatus[];
}

/**
 * YouTube analytics related type definitions
 */

// Channel analytics data type
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

// Video analytics data type
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

// Audience demographics data type
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
 * Title generation related type definitions
 */

// YouTube persona type
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

// Thumbnail text type
export interface ThumbnailText {
  text: string;
  rating: number;
  rationale: string;
  personaReactions: {
    personaName: string;
    reaction: string;
  }[];
}

// Title option type
export interface TitleOption {
  title: string;
  rating: number;
  rationale: string;
  thumbnailTextId: number;
  seoKeywords: string[];
}

// Title and thumbnail set type
export interface TitleAndThumbnailSet {
  thumbnailText: string;
  titles: string[];
}

// Video description type
export interface VideoDescriptionSet {
  description: string;
  tags: string[];
}

/**
 * Video planning related type definitions
 */

// Keyword data type
export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: string;
  relevance: number;
  rank: number;
}

// Competitor video type
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

// Content structure type
export interface ContentStructure {
  section: string;
  duration: string;
  purpose: string;
  description: string;
}

// Video tag type
export interface VideoTag {
  tag: string;
  relevance: number;
  searchVolume: number;
  competition: string;
}

// Audience retention strategy type
export interface AudienceRetentionStrategy {
  technique: string;
  implementation: string;
  expectedImpact: string;
  timeMarker: string;
}

/**
 * Input schema type definitions
 */

// Channel analytics input schema
export const channelAnalyticsInputSchema = z.object({
  channelId: z.string().describe('Channel ID to analyze'),
  startDate: z
    .string()
    .describe('Format: YYYY-MM-DD. Default: 30 days ago')
    .optional(),
  endDate: z
    .string()
    .describe('Format: YYYY-MM-DD. Default: today')
    .optional(),
  metrics: z
    .array(z.string())
    .describe('List of metrics to retrieve')
    .optional(),
  dimensions: z.string().describe('Analysis unit (day/month etc.)').optional(),
});

// Video analytics input schema
export const videoAnalyticsInputSchema = z.object({
  channelId: z.string().describe('Channel ID'),
  videoId: z.string().describe('Video ID to analyze'),
  startDate: z
    .string()
    .describe('Format: YYYY-MM-DD. Default: 30 days from video publication')
    .optional(),
  endDate: z
    .string()
    .describe('Format: YYYY-MM-DD. Default: today')
    .optional(),
  metrics: z
    .array(z.string())
    .describe('List of metrics to retrieve')
    .optional(),
});

// Title generator input schema
export const titleGeneratorInputSchema = z.object({
  videoContent: z.string().describe('The content/transcript of the video'),
  seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
  targetAudience: z.string().optional().describe('Description of the target audience'),
  videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
  channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
});

// Thumbnail title generator input schema
export const thumbnailTitleGeneratorInputSchema = z.object({
  videoContent: z.string().describe('The content summary or full script of the video'),
  seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
  targetAudience: z.string().optional().describe('Description of the target audience'),
  videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
  channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
  scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
});

// Video planning input schema
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