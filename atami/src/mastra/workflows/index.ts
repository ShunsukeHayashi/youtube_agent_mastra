// src/mastra/workflows/index.ts
// ------------------------------------------------------------------
// 共通 import
// ------------------------------------------------------------------
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// ------------------------------------------------------------------
// 個別ワークフロー（既存）
// 既存のワークフローのインポート
// ------------------------------------------------------------------
export { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
export {
  youtubeChannelAnalyticsWorkflow,
  youtubeVideoAnalyticsWorkflow,
} from './analyticsWorkflow';
export { inputCollectionWorkflow } from './inputCollectionWorkflow';
export { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
export { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
export { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
export { keywordResearchWorkflow } from './keywordResearchWorkflow';
export {
  youtubeChannelConceptDesignWorkflow,
  youtubeKeywordStrategyWorkflow,
} from './youtubeWorkflows';
export { youtubeVideoScriptGeneratorWorkflow } from './videoScriptGeneratorWorkflow';
export { youtubeVideoScriptGeneratorChain } from './videoScriptGeneratorWorkflow.langchain';
export { youtubeTitleGeneratorChain } from './titleGeneratorWorkflow.langchain';
export { youtubeTitleGeneratorVercelAI } from './titleGeneratorWorkflow.vercel-ai';

// ------------------------------------------------------------------
// 個別ワークフロー（新規追加）
// ------------------------------------------------------------------
export { youtubeLongFormRoadmapWorkflow } from './longFormRoadmapWorkflow';
export { youtubeLongFormOsaruWorkflow } from './longFormOsaruWorkflow';
export { youtubeLongFormMoezoWorkflow } from './longFormMoezoWorkflow';
export { youtubeLongFormConversationWorkflow } from './longFormConversationWorkflow';
export { youtubeContentScoringWorkflow } from './contentScoringWorkflow';
export { youtubeShortsIdeationWorkflow } from './shortsIdeationWorkflow';          // ← 名前を統一
export { youtubeShortsScriptWorkflow } from './shortsScriptWorkflow';
export { workflowLongformOsaru } from './workflow-longform-osaru';
export { workflowLongformMoezo } from './workflow-longform-moezo';

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

export { youtubeChannelPlannerWorkflow };
