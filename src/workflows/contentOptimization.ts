import { Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

export const contentOptimizationWorkflow = new Workflow({
  id: 'content-optimization-workflow',
  name: 'Content Optimization Workflow',
  description: 'Optimize YouTube content for maximum reach and engagement',
  inputSchema: z.object({
    videoTopic: z.string(),
    currentTitle: z.string().optional(),
    currentDescription: z.string().optional(),
    targetKeywords: z.array(z.string()),
    competitorVideos: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    optimizedTitle: z.object({
      primary: z.string(),
      alternatives: z.array(z.string()),
    }),
    optimizedDescription: z.string(),
    tags: z.array(z.string()),
    thumbnailConcepts: z.array(z.string()),
    seoScore: z.number(),
  }),
  steps: [
    {
      id: 'analyze-keywords',
      type: 'agent',
      agent: contentOptimizationAgent,
      prompt: async ({ input }) => ({
        messages: [{
          role: 'user',
          content: `Analyze these keywords for YouTube SEO: ${input.targetKeywords.join(', ')}.
          Topic: ${input.videoTopic}
          ${input.currentTitle ? `Current title: ${input.currentTitle}` : ''}
          
          Provide:
          - Keyword competitiveness
          - Search volume insights
          - Related keywords to include`
        }]
      }),
    },
    {
      id: 'optimize-title',
      type: 'agent',
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: 'user',
          content: `Create optimized YouTube titles for: ${input.videoTopic}
          Keywords: ${input.targetKeywords.join(', ')}
          ${input.currentTitle ? `Improve upon: ${input.currentTitle}` : ''}
          
          Provide:
          - One primary title (max 60 chars)
          - 3-5 alternative titles
          - Explanation of optimization tactics used`
        }]
      }),
    },
    {
      id: 'optimize-description',
      type: 'agent',
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: 'user',
          content: `Write an optimized YouTube description for: ${input.videoTopic}
          Keywords: ${input.targetKeywords.join(', ')}
          ${input.currentDescription ? `Improve upon: ${input.currentDescription}` : ''}
          
          Include:
          - Compelling first 125 characters
          - Natural keyword integration
          - Timestamp placeholders
          - Call-to-action
          - Relevant links section`
        }]
      }),
    },
    {
      id: 'generate-tags',
      type: 'agent',
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: 'user',
          content: `Generate optimized YouTube tags for: ${input.videoTopic}
          Primary keywords: ${input.targetKeywords.join(', ')}
          
          Provide 20-30 tags including:
          - Exact match keywords
          - Broad match variations
          - Long-tail keywords
          - Related topics`
        }]
      }),
    },
    {
      id: 'thumbnail-concepts',
      type: 'agent',
      agent: contentOptimizationAgent,
      prompt: async ({ input, steps }) => ({
        messages: [{
          role: 'user',
          content: `Suggest 3-5 thumbnail concepts for: ${input.videoTopic}
          
          For each concept include:
          - Visual elements
          - Text overlay suggestions
          - Color psychology reasoning
          - CTR optimization tactics`
        }]
      }),
    },
  ],
  output: async ({ steps }) => {
    // Parse and structure the output
    return {
      optimizedTitle: {
        primary: '',
        alternatives: [],
      },
      optimizedDescription: '',
      tags: [],
      thumbnailConcepts: [],
      seoScore: 0,
    };
  },
});