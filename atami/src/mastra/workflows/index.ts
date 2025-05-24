// src/mastra/workflows/index.ts
// ------------------------------------------------------------------
// 共通 import
// ------------------------------------------------------------------
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// ------------------------------------------------------------------
// 個別ワークフロー（既存）
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
