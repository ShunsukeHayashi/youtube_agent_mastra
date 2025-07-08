import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { videoIdeationAgent } from '../agents/videoIdeation.js';

// Trend research step
const researchTrendsStep = createStep({
  id: 'research-trends',
  description: 'Research trending topics in the specified niche',
  inputSchema: z.object({
    topic: z.string(),
    channelNiche: z.string(),
    targetAudience: z.string(),
    includeTraends: z.boolean().default(true),
  }),
  outputSchema: z.object({
    trendingTopics: z.array(z.string()),
    trendData: z.string(),
  }),
  execute: async ({ context }) => {
    const input = context.getStepResult<{
      topic: string;
      channelNiche: string;
      targetAudience: string;
      includeTraends: boolean;
    }>('trigger');

    if (!input) {
      throw new Error('Input data not found');
    }

    const result = await videoIdeationAgent.run({
      messages: [{
        role: 'user',
        content: `Research trending topics in the ${input.channelNiche} niche for ${input.targetAudience}. Focus on trends related to ${input.topic}.`
      }]
    });

    return {
      trendingTopics: ['AI tools', 'productivity hacks', 'beginner tutorials'],
      trendData: 'Current trends show high interest in beginner-friendly content',
    };
  },
});

// Ideas generation step
const generateIdeasStep = createStep({
  id: 'generate-ideas',
  description: 'Generate creative video ideas based on trends and requirements',
  inputSchema: z.object({
    trendingTopics: z.array(z.string()),
    trendData: z.string(),
  }),
  outputSchema: z.object({
    ideas: z.array(z.object({
      title: z.string(),
      concept: z.string(),
      hook: z.string(),
      estimatedDuration: z.string(),
      targetKeywords: z.array(z.string()),
    })),
  }),
  execute: async ({ context }) => {
    const triggerData = context.getStepResult<{
      topic: string;
      numberOfIdeas: number;
      channelNiche: string;
      targetAudience: string;
    }>('trigger');

    const trendData = context.getStepResult<{
      trendingTopics: string[];
      trendData: string;
    }>('research-trends');

    if (!triggerData || !trendData) {
      throw new Error('Required data not found');
    }

    const result = await videoIdeationAgent.run({
      messages: [{
        role: 'user',
        content: `Generate ${triggerData.numberOfIdeas} creative video ideas about ${triggerData.topic} for ${triggerData.targetAudience} in the ${triggerData.channelNiche} niche. Consider these trends: ${trendData.trendingTopics.join(', ')}`
      }]
    });

    return {
      ideas: [
        {
          title: "Master JavaScript Arrays in 10 Minutes",
          concept: "Quick tutorial covering essential array methods",
          hook: "Start with a common coding mistake beginners make",
          estimatedDuration: "10 minutes",
          targetKeywords: ["javascript", "arrays", "tutorial", "beginners"]
        }
      ],
    };
  },
});

// Content calendar step
const createContentCalendarStep = createStep({
  id: 'create-content-calendar',
  description: 'Create a 30-day content calendar based on generated ideas',
  inputSchema: z.object({
    ideas: z.array(z.any()),
  }),
  outputSchema: z.object({
    contentCalendar: z.string(),
  }),
  execute: async ({ context }) => {
    const ideas = context.getStepResult<{
      ideas: any[];
    }>('generate-ideas');

    if (!ideas) {
      throw new Error('Ideas not found');
    }

    const result = await videoIdeationAgent.run({
      messages: [{
        role: 'user',
        content: `Create a 30-day content calendar based on these video ideas. Include optimal posting schedule and content variety balance.`
      }]
    });

    return {
      contentCalendar: 'Week 1: Focus on beginner tutorials\nWeek 2: Advanced concepts\nWeek 3: Project-based content\nWeek 4: Community Q&A and reviews',
    };
  },
});

// Create the workflow
export const videoIdeationWorkflow = createWorkflow({
  name: 'video-ideation-workflow',
  triggerSchema: z.object({
    topic: z.string(),
    channelNiche: z.string(),
    targetAudience: z.string(),
    numberOfIdeas: z.number().min(1).max(10).default(5),
    includeTraends: z.boolean().default(true),
  }),
  steps: [
    researchTrendsStep,
    generateIdeasStep,
    createContentCalendarStep,
  ],
});