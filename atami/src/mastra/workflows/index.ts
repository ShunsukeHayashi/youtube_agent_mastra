import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

/**
 * Core YouTube Workflows
 */
export { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';
export { youtubeInputCollectionWorkflow } from './inputCollectionWorkflow';
export { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
export { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
export { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
export { youtubeKeywordResearchWorkflow } from './keywordResearchWorkflow';
export { youtubeChannelConceptDesignWorkflow, youtubeKeywordStrategyWorkflow } from './youtubeWorkflows';
export { youtubeVideoScriptGeneratorWorkflow } from './videoScriptGeneratorWorkflow';

/**
 * Long-Form Content Workflows
 */
export { youtubeLongFormRoadmapWorkflow } from './longFormRoadmapWorkflow';
export { youtubeLongFormOsaruWorkflow } from './longFormOsaruWorkflow';
export { youtubeLongFormMoezoWorkflow } from './longFormMoezoWorkflow';
export { youtubeLongFormConversationWorkflow } from './longFormConversationWorkflow';
export { youtubeContentScoringWorkflow } from './contentScoringWorkflow';
export { youtubeShortsIdeationWorkflow } from './shortsIdeationWorkflow';
export { youtubeShortsScriptWorkflow } from './shortsScriptWorkflow';

/**
 * Demo Workflows (defined in vNext format)
 */
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

// Commit the demo workflow
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

// Commit the demo workflow
youtubeChannelPlannerWorkflow.commit();

export { youtubeSearchWorkflow, youtubeChannelPlannerWorkflow };
