
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
  youtubeTitleWithScoreWorkflow
} from './workflows';
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

export const mastra = new Mastra({
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
    youtubeTitleWithScoreWorkflow
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
