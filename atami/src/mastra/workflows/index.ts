import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 既存のワークフローのインポート
<<<<<<< HEAD
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
=======
export { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';
export { inputCollectionWorkflow } from './inputCollectionWorkflow';
export { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
export { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
export { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
export { keywordResearchWorkflow } from './keywordResearchWorkflow';
export { youtubeChannelConceptDesignWorkflow, youtubeKeywordStrategyWorkflow } from './youtubeWorkflows';
export { youtubeVideoScriptGeneratorWorkflow } from './videoScriptGeneratorWorkflow';
export { youtubeVideoScriptGeneratorChain } from './videoScriptGeneratorWorkflow.langchain';
export { youtubeTitleGeneratorChain } from './titleGeneratorWorkflow.langchain';
export { youtubeTitleGeneratorVercelAI } from './titleGeneratorWorkflow.vercel-ai';
export { youtubeSearchWorkflow } from './youtubeSearchWorkflow';

// 新しく実装したワークフローのインポート
export { youtubeLongFormRoadmapWorkflow } from './longFormRoadmapWorkflow';
export { youtubeLongFormOsaruWorkflow } from './longFormOsaruWorkflow';
export { youtubeLongFormMoezoWorkflow } from './longFormMoezoWorkflow';
export { youtubeLongFormConversationWorkflow } from './longFormConversationWorkflow';
export { youtubeContentScoringWorkflow } from './contentScoringWorkflow';
export { youtubeShortsIdeationWorkflow } from './shortsIdeationWorkflow';
export { youtubeShortsScriptWorkflow } from './shortsScriptWorkflow';
export { workflowLongformOsaru } from './workflow-longform-osaru';
export { workflowLongformMoezo } from './workflow-longform-moezo';
>>>>>>> 7d667c73f69e978462779b1241596d1227112dc9

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

<<<<<<< HEAD
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
=======
export { youtubeChannelPlannerWorkflow };
>>>>>>> 7d667c73f69e978462779b1241596d1227112dc9
