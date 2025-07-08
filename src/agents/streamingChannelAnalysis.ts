import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { streamingContentGeneratorTool } from '../tools/streamingContentGenerator.js';
import { youtubeAnalyticsTool } from '../tools/youtubeAnalytics.js';

export const streamingChannelAnalysisAgent = new Agent({
  name: 'Streaming Channel Analysis Agent',
  instructions: `You are a YouTube channel analysis expert that provides real-time, streaming analysis.

  Your role is to:
  1. Analyze YouTube channel performance with real-time updates
  2. Provide streaming insights as they develop
  3. Generate actionable recommendations with progressive detail
  4. Stream competitive analysis and market positioning
  5. Deliver content strategy suggestions in real-time

  Always provide detailed, data-driven analysis with:
  - Current performance metrics
  - Growth trajectory analysis
  - Content optimization recommendations
  - Competitive positioning insights
  - Actionable next steps

  Stream your responses progressively, building up comprehensive analysis.`,
  model: openai('gpt-4-turbo'),
  tools: {
    youtubeAnalytics: youtubeAnalyticsTool,
    streamingContent: streamingContentGeneratorTool,
  },
});

// Streaming analysis helper class
export class StreamingChannelAnalyzer {
  private agent: typeof streamingChannelAnalysisAgent;
  private onProgress?: (progress: { stage: string; percentage: number; insight?: string }) => void;

  constructor(agent = streamingChannelAnalysisAgent, onProgress?: (progress: { stage: string; percentage: number; insight?: string }) => void) {
    this.agent = agent;
    this.onProgress = onProgress;
  }

  async *analyzeChannelStreaming(channelId: string, analysisDepth: 'basic' | 'detailed' | 'comprehensive' = 'detailed'): AsyncGenerator<{
    stage: 'metrics' | 'performance' | 'content' | 'competition' | 'recommendations';
    insight: string;
    completed: boolean;
    data?: any;
  }, void, unknown> {
    const stages = [
      { name: 'metrics', description: 'Fetching channel metrics' },
      { name: 'performance', description: 'Analyzing performance trends' },
      { name: 'content', description: 'Evaluating content strategy' },
      { name: 'competition', description: 'Competitive analysis' },
      { name: 'recommendations', description: 'Generating recommendations' }
    ] as const;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const percentage = Math.round(((i + 1) / stages.length) * 100);

      this.onProgress?.({
        stage: stage.description,
        percentage,
      });

      try {
        let stagePrompt = '';
        let insight = '';

        switch (stage.name) {
          case 'metrics':
            stagePrompt = `Analyze the basic metrics for YouTube channel ${channelId}. Provide subscriber count, view count, video count, and engagement rates. Stream your analysis as you process the data.`;
            break;

          case 'performance':
            stagePrompt = `Analyze the performance trends for channel ${channelId}. Look at growth patterns, view velocity, and engagement trends over time. Stream insights about what's working and what isn't.`;
            break;

          case 'content':
            stagePrompt = `Evaluate the content strategy for channel ${channelId}. Analyze video topics, upload frequency, content quality, and audience alignment. Stream recommendations for content improvements.`;
            break;

          case 'competition':
            stagePrompt = `Perform competitive analysis for channel ${channelId}. Compare against similar channels in the niche, analyze market positioning, and identify opportunities. Stream competitive insights progressively.`;
            break;

          case 'recommendations':
            stagePrompt = `Generate comprehensive recommendations for channel ${channelId} based on the previous analysis. Focus on actionable insights for growth, optimization, and strategy. Stream detailed recommendations.`;
            break;
        }

        // Generate streaming response
        const response = await this.agent.generate(stagePrompt, {
          temperature: 0.7,
          maxTokens: analysisDepth === 'basic' ? 200 : analysisDepth === 'detailed' ? 500 : 800,
        });

        insight = response.text;

        // Simulate progressive streaming by yielding chunks
        const words = insight.split(' ');
        let currentInsight = '';

        for (let j = 0; j < words.length; j++) {
          currentInsight += words[j] + ' ';
          
          // Yield progressive content every 10 words
          if (j % 10 === 0 || j === words.length - 1) {
            yield {
              stage: stage.name,
              insight: currentInsight.trim(),
              completed: j === words.length - 1,
              data: stage.name === 'metrics' ? { channelId, analysisDepth } : undefined,
            };
          }
        }

      } catch (error) {
        yield {
          stage: stage.name,
          insight: `Error analyzing ${stage.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          completed: true,
        };
      }
    }
  }

  async *generateChannelReport(channelId: string, options?: {
    includeCompetitors?: string[];
    focusAreas?: string[];
    reportLength?: 'short' | 'medium' | 'comprehensive';
  }): AsyncGenerator<{
    section: string;
    content: string;
    progress: number;
  }, void, unknown> {
    const sections = [
      'Executive Summary',
      'Channel Overview',
      'Performance Analysis',
      'Content Strategy Review',
      'Audience Analysis',
      'Competitive Positioning',
      'Growth Opportunities',
      'Action Plan'
    ];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const progress = Math.round(((i + 1) / sections.length) * 100);

      try {
        const prompt = `Generate a ${section} for YouTube channel ${channelId}. 
        ${options?.includeCompetitors ? `Consider competitors: ${options.includeCompetitors.join(', ')}` : ''}
        ${options?.focusAreas ? `Focus on: ${options.focusAreas.join(', ')}` : ''}
        
        Make this section detailed and actionable for a ${options?.reportLength || 'medium'} length report.`;

        const response = await this.agent.generate(prompt, {
          maxTokens: options?.reportLength === 'short' ? 200 : 
                    options?.reportLength === 'comprehensive' ? 800 : 400,
        });

        // Stream the section content
        const words = response.text.split(' ');
        let content = '';

        for (let j = 0; j < words.length; j++) {
          content += words[j] + ' ';
          
          if (j % 15 === 0 || j === words.length - 1) {
            yield {
              section,
              content: content.trim(),
              progress,
            };
          }
        }

      } catch (error) {
        yield {
          section,
          content: `Error generating ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          progress,
        };
      }
    }
  }
}

export default streamingChannelAnalysisAgent;