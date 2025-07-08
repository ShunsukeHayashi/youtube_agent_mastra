import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { config } from 'dotenv';

// Import agents
import { channelAnalysisAgent } from './agents/channelAnalysis.js';
import { videoIdeationAgent } from './agents/videoIdeation.js';
import { contentOptimizationAgent } from './agents/contentOptimization.js';

// Import workflows
import { channelAnalysisWorkflow } from './workflows/channelAnalysis.js';
import { videoIdeationWorkflow } from './workflows/videoIdeation.js';
import { contentOptimizationWorkflow } from './workflows/contentOptimization.js';

// Load environment variables
config();

// Initialize Mastra
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
  logger: new PinoLogger(),
});

// Example usage
async function main() {
  console.log('YouTube Mastra Agent initialized successfully');
  
  // Example: Analyze a channel
  const channelAnalysis = await mastra.agents.channelAnalysis.run({
    messages: [{
      role: 'user',
      content: 'Analyze the YouTube channel with ID: UCxxxxxxx'
    }]
  });
  
  console.log('Channel Analysis:', channelAnalysis);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}