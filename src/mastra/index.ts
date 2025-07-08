import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { config } from 'dotenv';

// Import agents
import { channelAnalysisAgent } from '../agents/channelAnalysis.js';
import { videoIdeationAgent } from '../agents/videoIdeation.js';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

// Note: workflow functions are exported separately to avoid circular imports

// Load environment variables
config();

// Export all components for external use
export * from '../agents/channelAnalysis.js';
export * from '../agents/videoIdeation.js';
export * from '../agents/contentOptimization.js';
// Note: simpleWorkflows exported separately
export * from '../tools/youtubeAnalytics.js';
export * from '../tools/contentGenerator.js';

// Export streaming components (temporarily disabled)
// export * from '../agents/streamingChannelAnalysis.js';
// export * from '../tools/streamingContentGenerator.js';
// export * from '../streaming/streamingWorkflows.js';

// Export Mastra instance
export const mastra = new Mastra({
  agents: {
    channelAnalysis: channelAnalysisAgent,
    videoIdeation: videoIdeationAgent,
    contentOptimization: contentOptimizationAgent,
  },
  logger: new PinoLogger(),
});

// Note: workflows exported from simpleWorkflows.js directly

export default mastra;