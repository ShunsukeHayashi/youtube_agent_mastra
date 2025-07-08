import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { config } from 'dotenv';

// Import agents
import { channelAnalysisAgent } from '../agents/channelAnalysis.js';
import { videoIdeationAgent } from '../agents/videoIdeation.js';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

// Import workflows
import { channelAnalysisWorkflow } from '../workflows/channelAnalysis.js';
import { videoIdeationWorkflow } from '../workflows/videoIdeation.js';
import { contentOptimizationWorkflow } from '../workflows/contentOptimization.js';

// Import tools
import { youtubeAnalyticsTool } from '../tools/youtubeAnalytics.js';
import { contentGeneratorTool } from '../tools/contentGenerator.js';

// Load environment variables
config();

// Export all components for external use
export * from '../agents/channelAnalysis.js';
export * from '../agents/videoIdeation.js';
export * from '../agents/contentOptimization.js';
export * from '../workflows/channelAnalysis.js';
export * from '../workflows/videoIdeation.js';
export * from '../workflows/contentOptimization.js';
export * from '../tools/youtubeAnalytics.js';
export * from '../tools/contentGenerator.js';

// Export Mastra instance
export const mastra = new Mastra({
  agents: {
    channelAnalysis: channelAnalysisAgent,
    videoIdeation: videoIdeationAgent,
    contentOptimization: contentOptimizationAgent,
  },
  workflows: {
    channelAnalysis: channelAnalysisWorkflow,
    videoIdeation: videoIdeationWorkflow,
    contentOptimization: contentOptimizationWorkflow,
  },
  tools: {
    youtubeAnalytics: youtubeAnalyticsTool,
    contentGenerator: contentGeneratorTool,
  },
  logger: new PinoLogger(),
});

export default mastra;