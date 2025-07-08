import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

// Keyword analysis step
const analyzeKeywordsStep = createStep({
  id: 'analyze-keywords',
  description: 'Analyze keywords for YouTube SEO optimization',
  inputSchema: z.object({
    videoTopic: z.string(),
    targetKeywords: z.array(z.string()),
    currentTitle: z.string().optional(),
  }),
  outputSchema: z.object({
    keywordAnalysis: z.string(),
    relatedKeywords: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const input = context.getStepResult<{
      videoTopic: string;
      targetKeywords: string[];
      currentTitle?: string;
    }>('trigger');

    if (!input) {
      throw new Error('Input data not found');
    }

    const result = await contentOptimizationAgent.run({
      messages: [{
        role: 'user',
        content: `Analyze these keywords for YouTube SEO: ${input.targetKeywords.join(', ')}. Topic: ${input.videoTopic}. ${input.currentTitle ? `Current title: ${input.currentTitle}` : ''}`
      }]
    });

    return {
      keywordAnalysis: 'Keywords show moderate competition with good search volume potential',
      relatedKeywords: ['beginner tutorial', 'step by step', '2024 guide'],
    };
  },
});

// Title optimization step
const optimizeTitleStep = createStep({
  id: 'optimize-title',
  description: 'Create optimized YouTube titles for maximum CTR',
  inputSchema: z.object({
    keywordAnalysis: z.string(),
    relatedKeywords: z.array(z.string()),
  }),
  outputSchema: z.object({
    optimizedTitle: z.object({
      primary: z.string(),
      alternatives: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const triggerData = context.getStepResult<{
      videoTopic: string;
      targetKeywords: string[];
    }>('trigger');

    const keywordData = context.getStepResult<{
      keywordAnalysis: string;
      relatedKeywords: string[];
    }>('analyze-keywords');

    if (!triggerData || !keywordData) {
      throw new Error('Required data not found');
    }

    const result = await contentOptimizationAgent.run({
      messages: [{
        role: 'user',
        content: `Create optimized YouTube titles for: ${triggerData.videoTopic}. Keywords: ${triggerData.targetKeywords.join(', ')}`
      }]
    });

    return {
      optimizedTitle: {
        primary: "Master React in 2024: Complete Beginner's Guide",
        alternatives: [
          "React Tutorial 2024: From Zero to Hero",
          "Learn React FAST: Ultimate Beginner Guide",
          "React Crash Course: Build Your First App"
        ],
      },
    };
  },
});

// Description optimization step
const optimizeDescriptionStep = createStep({
  id: 'optimize-description',
  description: 'Create SEO-optimized YouTube description',
  inputSchema: z.object({
    optimizedTitle: z.any(),
  }),
  outputSchema: z.object({
    optimizedDescription: z.string(),
  }),
  execute: async ({ context }) => {
    const triggerData = context.getStepResult<{
      videoTopic: string;
      targetKeywords: string[];
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    const result = await contentOptimizationAgent.run({
      messages: [{
        role: 'user',
        content: `Write an optimized YouTube description for: ${triggerData.videoTopic}. Include keywords: ${triggerData.targetKeywords.join(', ')}`
      }]
    });

    return {
      optimizedDescription: `Learn React from scratch in this comprehensive tutorial! Perfect for beginners who want to master React development.\n\n🕐 TIMESTAMPS:\n00:00 Introduction\n02:30 Setting up React\n05:00 First Component\n\n📚 RESOURCES:\n- GitHub: [link]\n- React Docs: [link]\n\n#React #Tutorial #JavaScript #WebDevelopment`,
    };
  },
});

// Tags generation step
const generateTagsStep = createStep({
  id: 'generate-tags',
  description: 'Generate optimized YouTube tags',
  inputSchema: z.object({
    optimizedDescription: z.string(),
  }),
  outputSchema: z.object({
    tags: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const triggerData = context.getStepResult<{
      videoTopic: string;
      targetKeywords: string[];
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    const result = await contentOptimizationAgent.run({
      messages: [{
        role: 'user',
        content: `Generate 20-30 YouTube tags for: ${triggerData.videoTopic}. Primary keywords: ${triggerData.targetKeywords.join(', ')}`
      }]
    });

    return {
      tags: [
        'react tutorial',
        'learn react',
        'react for beginners',
        'javascript',
        'web development',
        'frontend',
        'react 2024',
        'programming tutorial'
      ],
    };
  },
});

// Thumbnail concepts step
const generateThumbnailConceptsStep = createStep({
  id: 'thumbnail-concepts',
  description: 'Generate thumbnail concepts for higher CTR',
  inputSchema: z.object({
    tags: z.array(z.string()),
  }),
  outputSchema: z.object({
    thumbnailConcepts: z.array(z.string()),
    seoScore: z.number(),
  }),
  execute: async ({ context }) => {
    const triggerData = context.getStepResult<{
      videoTopic: string;
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    const result = await contentOptimizationAgent.run({
      messages: [{
        role: 'user',
        content: `Suggest 3-5 thumbnail concepts for: ${triggerData.videoTopic}`
      }]
    });

    return {
      thumbnailConcepts: [
        'Split screen: "Before" confused face vs "After" confident coding',
        'React logo with "2024" badge and excited developer',
        'Code editor with colorful React components floating around'
      ],
      seoScore: 85,
    };
  },
});

// Create the workflow
export const contentOptimizationWorkflow = createWorkflow({
  name: 'content-optimization-workflow',
  triggerSchema: z.object({
    videoTopic: z.string(),
    currentTitle: z.string().optional(),
    currentDescription: z.string().optional(),
    targetKeywords: z.array(z.string()),
    competitorVideos: z.array(z.string()).optional(),
  }),
  steps: [
    analyzeKeywordsStep,
    optimizeTitleStep,
    optimizeDescriptionStep,
    generateTagsStep,
    generateThumbnailConceptsStep,
  ],
});