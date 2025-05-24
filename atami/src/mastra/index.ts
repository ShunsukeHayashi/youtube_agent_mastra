// @ts-nocheck
// .envファイルを読み込む
import dotenv from 'dotenv';
dotenv.config();

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import {
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
  youtubeLongFormRoadmapWorkflow,
  youtubeLongFormOsaruWorkflow,
  youtubeLongFormMoezoWorkflow,
  youtubeLongFormConversationWorkflow,
  youtubeContentScoringWorkflow,
  youtubeShortsIdeationWorkflow,
  youtubeShortsScriptWorkflow,
  youtubeSearchWorkflow
} from './workflows';
// Langchainのチェーンは別途インポートして使用する
import { youtubeVideoScriptGeneratorChain } from './workflows';
import {
  youtubeAgent,
  youtubeTitleGeneratorAgent,
  youtubeAnalyticsAgent,
  youtubeChannelPlannerAgent,
  inputCollectionAgent,
  channelConceptAgent,
  youtubeThumbnailTitleGeneratorAgent,
  youtubeVideoPlanningAgent,
  keywordResearchAgent
} from './agents';
import { titleGeneratorApi } from './api/titleGenerator';

export { consistencyEvalStep } from './steps';

export const mastra = new Mastra({
  apiRoutes: [
    titleGeneratorApi
  ],
  workflows: {
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
    youtubeLongFormRoadmapWorkflow,
    youtubeLongFormOsaruWorkflow,
    youtubeLongFormMoezoWorkflow,
    youtubeLongFormConversationWorkflow,
    youtubeContentScoringWorkflow,
    youtubeShortsIdeationWorkflow,
    youtubeShortsScriptWorkflow,
    youtubeSearchWorkflow
  },
  agents: {
    youtubeAgent,
    youtubeTitleGeneratorAgent,
    youtubeAnalyticsAgent,
    youtubeChannelPlannerAgent,
    inputCollectionAgent,
    channelConceptAgent,
    youtubeThumbnailTitleGeneratorAgent,
    youtubeVideoPlanningAgent,
    keywordResearchAgent
  },
  storage: new LibSQLStore({
    // For persistent storage, use file path instead of memory
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'YouTube Mastra',
    level: 'info',
  }),
});
