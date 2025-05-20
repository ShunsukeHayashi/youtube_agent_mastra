import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';
import { 
  youtubeSearchWorkflow, 
  youtubeChannelPlannerWorkflow, 
  youtubeTitleGeneratorWorkflow,
  youtubeChannelAnalyticsWorkflow,
  youtubeVideoAnalyticsWorkflow
} from './workflows';
import { 
  youtubeAgent, 
  youtubeChannelPlannerAgent, 
  youtubeTitleGeneratorAgent,
  youtubeAnalyticsAgent
} from './agents';

// Import auth module separately to avoid circular dependencies
import * as googleAuth from './lib/google.js';

// Initialize Google auth if credentials are available
try {
  googleAuth.initializeGoogleAuth();
} catch (error) {
  console.warn('Failed to initialize Google auth:', error);
}

export const mastra = new Mastra({
  workflows: { 
    youtubeSearchWorkflow,
    youtubeChannelPlannerWorkflow,
    youtubeTitleGeneratorWorkflow,
    youtubeChannelAnalyticsWorkflow,
    youtubeVideoAnalyticsWorkflow
  },
  agents: { 
    youtubeAgent,
    youtubeChannelPlannerAgent,
    youtubeTitleGeneratorAgent,
    youtubeAnalyticsAgent
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});