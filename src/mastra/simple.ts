import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';

// Import agents
import { channelAnalysisAgent } from '../agents/channelAnalysis.js';
import { videoIdeationAgent } from '../agents/videoIdeation.js';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

// Create Mastra instance
export const mastra = new Mastra({
  agents: {
    channelAnalysis: channelAnalysisAgent,
    videoIdeation: videoIdeationAgent,
    contentOptimization: contentOptimizationAgent,
  },
  logger: new PinoLogger(),
});

export default mastra;