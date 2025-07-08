import { Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { videoIdeationAgent } from '../agents/videoIdeation.js';

export const videoIdeationWorkflow = new Workflow({
  id: 'video-ideation-workflow',
  name: 'Video Ideation Workflow',
  description: 'Generate creative video ideas based on trends and channel niche',
  inputSchema: z.object({
    topic: z.string(),
    channelNiche: z.string(),
    targetAudience: z.string(),
    numberOfIdeas: z.number().min(1).max(10).default(5),
    includeTraends: z.boolean().default(true),
  }),
  outputSchema: z.object({
    ideas: z.array(z.object({
      title: z.string(),
      concept: z.string(),
      hook: z.string(),
      estimatedDuration: z.string(),
      targetKeywords: z.array(z.string()),
    })),
    trendingTopics: z.array(z.string()).optional(),
    contentCalendar: z.string().optional(),
  }),
  steps: [
    {
      id: 'research-trends',
      type: 'agent',
      agent: videoIdeationAgent,
      prompt: async ({ input }) => ({
        messages: [{
          role: 'user',
          content: `Research trending topics in the ${input.channelNiche} niche.
          Target audience: ${input.targetAudience}.
          Find current trends and viral content ideas related to ${input.topic}.`
        }]
      }),
      condition: ({ input }) => input.includeTraends,
    },
    {
      id: 'generate-ideas',
      type: 'agent',
      agent: videoIdeationAgent,
      prompt: async ({ input, steps }) => {
        const trendData = steps['research-trends']?.output || '';
        return {
          messages: [{
            role: 'user',
            content: `Generate ${input.numberOfIdeas} creative video ideas about ${input.topic}.
            Channel niche: ${input.channelNiche}
            Target audience: ${input.targetAudience}
            ${trendData ? `Consider these trends: ${trendData}` : ''}
            
            For each idea, provide:
            - Catchy title
            - Concept description
            - Hook for first 15 seconds
            - Estimated video duration
            - Target keywords`
          }]
        };
      },
    },
    {
      id: 'create-content-calendar',
      type: 'agent', 
      agent: videoIdeationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: 'user',
          content: `Based on the generated ideas, create a 30-day content calendar.
          Include:
          - Optimal posting schedule
          - Content variety balance
          - Series or theme suggestions
          - Special date tie-ins`
        }]
      }),
    },
  ],
  output: async ({ steps }) => {
    // Parse and structure the output
    return {
      ideas: [],
      trendingTopics: [],
      contentCalendar: steps['create-content-calendar']?.output,
    };
  },
});