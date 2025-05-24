import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 既存のワークフローのインポート
import { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
import { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';
import { inputCollectionWorkflow } from './inputCollectionWorkflow';
import { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
import { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
import { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
import { keywordResearchWorkflow } from './keywordResearchWorkflow';
import { youtubeChannelConceptDesignWorkflow, youtubeKeywordStrategyWorkflow } from './youtubeWorkflows';
import { youtubeVideoScriptGeneratorWorkflow } from './videoScriptGeneratorWorkflow';
import { youtubeVideoScriptGeneratorChain } from './videoScriptGeneratorWorkflow.langchain';
import { youtubeTitleGeneratorChain } from './titleGeneratorWorkflow.langchain';
import { youtubeTitleGeneratorVercelAI } from './titleGeneratorWorkflow.vercel-ai';

// 新しく実装したワークフローのインポート
import { youtubeLongFormRoadmapWorkflow } from './longFormRoadmapWorkflow';
import { youtubeLongFormOsaruWorkflow } from './longFormOsaruWorkflow';
import { youtubeLongFormMoezoWorkflow } from './longFormMoezoWorkflow';
import { youtubeLongFormConversationWorkflow } from './longFormConversationWorkflow';
import { youtubeContentScoringWorkflow } from './contentScoringWorkflow';
import { youtubeShortsIdeationWorkflow  } from './shortsIdeationWorkflow';
import { youtubeShortsScriptWorkflow } from './shortsScriptWorkflow';

// ダミーワークフロー（vNext形式で定義）
const youtubeSearchWorkflow = createWorkflow({
  id: 'youtube-search-workflow',
  description: 'Search for YouTube videos based on keywords (Not implemented)',
  inputSchema: z.object({
    keywords: z.string().describe('Keywords to search for'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      videos: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        thumbnailUrl: z.string(),
        channelTitle: z.string(),
        publishedAt: z.string(),
      })).optional(),
    }).optional(),
  }),
});

// ダミーワークフローをコミット
youtubeSearchWorkflow.commit();

const youtubeChannelPlannerWorkflow = createWorkflow({
  id: 'youtube-channel-planner-workflow',
  description: 'Plan a YouTube channel content strategy (Not implemented)',
  inputSchema: z.object({
    channelName: z.string().describe('Name of the YouTube channel'),
    channelDescription: z.string().describe('Description of the YouTube channel'),
    targetAudience: z.string().describe('Target audience of the YouTube channel'),
    contentGoals: z.string().describe('Content goals of the YouTube channel'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      contentPlan: z.string().optional(),
      videoIdeas: z.array(z.string()).optional(),
      schedule: z.string().optional(),
    }).optional(),
  }),
});

// ダミーワークフローをコミット
youtubeChannelPlannerWorkflow.commit();

export {
  youtubeTitleGeneratorWorkflow,
  youtubeChannelAnalyticsWorkflow,
  youtubeVideoAnalyticsWorkflow,
  inputCollectionWorkflow,
  youtubeChannelConceptWorkflow,
  youtubeThumbnailTitleGeneratorWorkflow,
  youtubeVideoPlanningWorkflow,
  keywordResearchWorkflow,
  youtubeChannelConceptDesignWorkflow,
  youtubeKeywordStrategyWorkflow,
  youtubeVideoScriptGeneratorWorkflow,
  youtubeVideoScriptGeneratorChain,
  youtubeTitleGeneratorChain,
  youtubeTitleGeneratorVercelAI,
  youtubeLongFormRoadmapWorkflow,
  youtubeLongFormOsaruWorkflow,
  youtubeLongFormMoezoWorkflow,
  youtubeLongFormConversationWorkflow,
  youtubeContentScoringWorkflow,
  youtubeShortsIdeationWorkflow ,
  youtubeShortsScriptWorkflow,
  youtubeSearchWorkflow,
  youtubeChannelPlannerWorkflow,
};
