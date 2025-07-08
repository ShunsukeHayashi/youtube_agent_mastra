import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

// Simple Mastra instance for deployment
export const mastra = new Mastra({
  agents: {
    youtubeAgent: new Agent({
      name: 'YouTube Assistant',
      instructions: 'You are a helpful YouTube assistant for channel analysis and content creation.',
      model: openai('gpt-4'),
      tools: {},
    }),
  },
  logger: new PinoLogger(),
});

export default mastra;