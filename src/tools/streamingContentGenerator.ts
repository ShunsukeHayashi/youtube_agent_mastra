import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const streamingContentGeneratorTool = createTool({
  id: 'streaming-content-generator',
  description: 'Generate YouTube content with real-time streaming responses',
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
    stream: z.any().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  execute: async ({ context }) => {
    const { type, topic, style, targetAudience, keywords, length } = context;
    
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

      // Create streaming response
      const streamResult = await streamText({
        model: openai('gpt-4-turbo'),
        prompt,
        temperature: 0.7,
      });

      // Collect full text for compatibility
      let fullContent = '';
      for await (const chunk of streamResult.textStream) {
        fullContent += chunk;
      }

      return {
        success: true,
        content: fullContent,
        stream: streamResult.textStream,
        metadata: {
          type,
          topic,
          streamingEnabled: true,
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

// Streaming helper function for real-time content generation
export async function* generateStreamingContent(
  type: 'idea' | 'title' | 'description' | 'script' | 'tags',
  topic: string,
  options?: {
    style?: string;
    targetAudience?: string;
    keywords?: string[];
    length?: 'short' | 'medium' | 'long';
  }
): AsyncGenerator<string, void, unknown> {
  try {
    const result = await streamingContentGeneratorTool.execute({
      context: {
        type,
        topic,
        ...options,
      }
    });

    if (result.success && result.stream) {
      for await (const chunk of result.stream) {
        yield chunk;
      }
    }
  } catch (error) {
    yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Real-time YouTube content generator with progress updates
export class StreamingYouTubeContentGenerator {
  private onProgress?: (progress: { step: string; percentage: number; content?: string }) => void;

  constructor(onProgress?: (progress: { step: string; percentage: number; content?: string }) => void) {
    this.onProgress = onProgress;
  }

  async *generateCompleteVideoContent(topic: string, options?: {
    targetAudience?: string;
    style?: string;
    keywords?: string[];
  }): AsyncGenerator<{
    step: 'title' | 'description' | 'script' | 'tags';
    content: string;
    completed: boolean;
  }, void, unknown> {
    const steps = ['title', 'description', 'script', 'tags'] as const;
    const results: Record<string, string> = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const percentage = Math.round(((i + 1) / steps.length) * 100);
      
      this.onProgress?.({
        step: `Generating ${step}...`,
        percentage,
      });

      let content = '';
      for await (const chunk of generateStreamingContent(step, topic, options)) {
        content += chunk;
        
        // Yield partial content for real-time updates
        yield {
          step,
          content,
          completed: false,
        };
      }

      results[step] = content;
      
      // Yield completed step
      yield {
        step,
        content,
        completed: true,
      };
    }
  }
}