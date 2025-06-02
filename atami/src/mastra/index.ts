import dotenv from 'dotenv';
dotenv.config();

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import {
  youtubeTitleGeneratorWorkflow,
  youtubeChannelAnalyticsWorkflow,
  youtubeVideoAnalyticsWorkflow,
  youtubeInputCollectionWorkflow,
  youtubeChannelConceptWorkflow,
  youtubeThumbnailTitleGeneratorWorkflow,
  youtubeVideoPlanningWorkflow,
  youtubeKeywordResearchWorkflow,
  youtubeChannelConceptDesignWorkflow,
  youtubeKeywordStrategyWorkflow
} from './workflows';
import {
  youtubeSearchAgent,
  youtubeTitleGeneratorAgent,
  youtubeAnalyticsAgent,
  youtubeChannelPlannerAgent,
  youtubeInputCollectionAgent,
  youtubeChannelConceptAgent,
  youtubeThumbnailTitleGeneratorAgent,
  youtubeVideoPlanningAgent,
  youtubeKeywordResearchAgent,
  youtubeOrchestratorAgent
} from './agents';
import { 
  youtubeLongFormContentChain,
  youtubeShortsContentChain
} from './chains';

// Export orchestration module
export * from './orchestration';

// Export workflow chains
export const chains = {
  youtubeLongFormContentChain,
  youtubeShortsContentChain
};

export const mastra = new Mastra({
  workflows: {
    youtubeTitleGeneratorWorkflow,
    youtubeChannelAnalyticsWorkflow,
    youtubeVideoAnalyticsWorkflow,
    youtubeInputCollectionWorkflow,
    youtubeChannelConceptWorkflow,
    youtubeThumbnailTitleGeneratorWorkflow,
    youtubeVideoPlanningWorkflow,
    youtubeKeywordResearchWorkflow,
    youtubeChannelConceptDesignWorkflow,
    youtubeKeywordStrategyWorkflow
  },
  agents: {
    youtubeSearchAgent,
    youtubeTitleGeneratorAgent,
    youtubeAnalyticsAgent,
    youtubeChannelPlannerAgent,
    youtubeInputCollectionAgent,
    youtubeChannelConceptAgent,
    youtubeThumbnailTitleGeneratorAgent,
    youtubeVideoPlanningAgent,
    youtubeKeywordResearchAgent,
    youtubeOrchestratorAgent
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