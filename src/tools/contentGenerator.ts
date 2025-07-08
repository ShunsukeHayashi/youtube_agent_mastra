import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const contentGeneratorTool = createTool({
  id: 'content-generator',
  name: 'Content Generator Tool',
  description: 'Generate YouTube content ideas, titles, descriptions, and scripts',
  inputSchema: z.object({
    type: z.enum(['idea', 'title', 'description', 'script', 'tags']),
    topic: z.string(),
    style: z.string().optional(),
    targetAudience: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
  }),
  execute: async ({ type, topic, style, targetAudience, keywords, length }) => {
    try {
      let prompt = '';
      
      switch (type) {
        case 'idea':
          prompt = `Generate a creative YouTube video idea about "${topic}".
          ${targetAudience ? `Target audience: ${targetAudience}` : ''}
          ${style ? `Style: ${style}` : ''}
          Include:
          - Hook concept
          - Main content points
          - Call to action`;
          break;
          
        case 'title':
          prompt = `Create an engaging YouTube video title about "${topic}".
          ${keywords ? `Include keywords: ${keywords.join(', ')}` : ''}
          Requirements:
          - Under 60 characters
          - Include emotional trigger
          - SEO optimized
          - Clickable but not clickbait`;
          break;
          
        case 'description':
          prompt = `Write a YouTube video description about "${topic}".
          ${keywords ? `Include keywords: ${keywords.join(', ')}` : ''}
          Include:
          - Brief summary (2-3 sentences)
          - Key timestamps placeholder
          - Relevant links section
          - Social media links
          - SEO keywords naturally integrated`;
          break;
          
        case 'script':
          const scriptLength = length === 'short' ? '1-3 minutes' : 
                             length === 'long' ? '10-15 minutes' : '5-7 minutes';
          prompt = `Write a YouTube video script about "${topic}".
          Length: ${scriptLength}
          ${targetAudience ? `Target audience: ${targetAudience}` : ''}
          ${style ? `Style: ${style}` : ''}
          Structure:
          - Hook (first 15 seconds)
          - Introduction
          - Main content with clear sections
          - Conclusion with CTA`;
          break;
          
        case 'tags':
          prompt = `Generate 15-20 YouTube tags for a video about "${topic}".
          ${keywords ? `Primary keywords: ${keywords.join(', ')}` : ''}
          Include:
          - Broad tags
          - Specific tags
          - Long-tail keywords
          - Related topics`;
          break;
      }

      const { text } = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
        temperature: 0.7,
      });

      return {
        success: true,
        content: text,
        metadata: {
          type,
          topic,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});