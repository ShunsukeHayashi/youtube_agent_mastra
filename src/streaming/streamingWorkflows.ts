// Real-time streaming workflows for YouTube Agent
import { StreamingChannelAnalyzer } from '../agents/streamingChannelAnalysis.js';
import { StreamingYouTubeContentGenerator } from '../tools/streamingContentGenerator.js';
// Note: mastra instance created locally to avoid circular dependency
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { channelAnalysisAgent } from '../agents/channelAnalysis.js';
import { videoIdeationAgent } from '../agents/videoIdeation.js';
import { contentOptimizationAgent } from '../agents/contentOptimization.js';

// Local mastra instance for streaming workflows
const mastra = new Mastra({
  agents: {
    channelAnalysis: channelAnalysisAgent,
    videoIdeation: videoIdeationAgent,
    contentOptimization: contentOptimizationAgent,
  },
  logger: new PinoLogger(),
});

export interface StreamingWorkflowProgress {
  workflowId: string;
  step: string;
  progress: number;
  status: 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export type ProgressCallback = (progress: StreamingWorkflowProgress) => void;

// Streaming Channel Analysis Workflow
export async function* runStreamingChannelAnalysisWorkflow(
  channelId: string,
  options?: {
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    includeCompetitors?: string[];
    generateReport?: boolean;
  },
  onProgress?: ProgressCallback
): AsyncGenerator<StreamingWorkflowProgress, void, unknown> {
  const workflowId = `channel-analysis-${Date.now()}`;
  let currentProgress = 0;

  try {
    // Initialize streaming analyzer
    const analyzer = new StreamingChannelAnalyzer(
      undefined,
      (progress) => {
        onProgress?.({
          workflowId,
          step: progress.stage,
          progress: progress.percentage,
          status: 'running'
        });
      }
    );

    // Step 1: Stream channel analysis
    yield {
      workflowId,
      step: 'Starting channel analysis',
      progress: 10,
      status: 'running'
    };

    const analysisResults: any[] = [];
    for await (const analysis of analyzer.analyzeChannelStreaming(
      channelId, 
      options?.analysisDepth || 'detailed'
    )) {
      currentProgress = 10 + (analysis.completed ? 15 : 5);
      
      analysisResults.push(analysis);
      
      yield {
        workflowId,
        step: `Analyzing: ${analysis.stage}`,
        progress: currentProgress,
        status: 'running',
        result: analysis
      };
    }

    // Step 2: Generate comprehensive report if requested
    if (options?.generateReport) {
      yield {
        workflowId,
        step: 'Generating comprehensive report',
        progress: 60,
        status: 'running'
      };

      const reportSections: any[] = [];
      for await (const section of analyzer.generateChannelReport(channelId, {
        includeCompetitors: options.includeCompetitors,
        reportLength: options.analysisDepth === 'basic' ? 'short' : 'comprehensive'
      })) {
        currentProgress = 60 + (section.progress * 0.3);
        
        reportSections.push(section);
        
        yield {
          workflowId,
          step: `Report: ${section.section}`,
          progress: currentProgress,
          status: 'running',
          result: section
        };
      }

      yield {
        workflowId,
        step: 'Analysis and report completed',
        progress: 100,
        status: 'completed',
        result: {
          analysis: analysisResults,
          report: reportSections,
          channelId,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      yield {
        workflowId,
        step: 'Channel analysis completed',
        progress: 100,
        status: 'completed',
        result: {
          analysis: analysisResults,
          channelId,
          timestamp: new Date().toISOString()
        }
      };
    }

  } catch (error) {
    yield {
      workflowId,
      step: 'Error in channel analysis',
      progress: currentProgress,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Streaming Video Content Creation Workflow
export async function* runStreamingVideoCreationWorkflow(
  topic: string,
  options?: {
    targetAudience?: string;
    style?: string;
    keywords?: string[];
    includeScript?: boolean;
  },
  onProgress?: ProgressCallback
): AsyncGenerator<StreamingWorkflowProgress, void, unknown> {
  const workflowId = `video-creation-${Date.now()}`;
  let currentProgress = 0;

  try {
    const generator = new StreamingYouTubeContentGenerator((progress) => {
      onProgress?.({
        workflowId,
        step: progress.step,
        progress: progress.percentage,
        status: 'running'
      });
    });

    yield {
      workflowId,
      step: 'Starting video content creation',
      progress: 5,
      status: 'running'
    };

    const contentResults: any[] = [];
    
    // Generate all content components with streaming
    for await (const content of generator.generateCompleteVideoContent(topic, {
      targetAudience: options?.targetAudience,
      style: options?.style,
      keywords: options?.keywords
    })) {
      currentProgress = 5 + (content.completed ? 20 : 5);
      
      contentResults.push(content);
      
      yield {
        workflowId,
        step: `Creating ${content.step}`,
        progress: currentProgress,
        status: 'running',
        result: content
      };
    }

    // Additional script generation if requested
    if (options?.includeScript) {
      yield {
        workflowId,
        step: 'Generating detailed script',
        progress: 80,
        status: 'running'
      };

      // Generate detailed script with streaming
      const agent = await mastra.getAgent('videoIdeation');
      const scriptPrompt = `Create a detailed YouTube video script for "${topic}".
      ${options.targetAudience ? `Target audience: ${options.targetAudience}` : ''}
      ${options.style ? `Style: ${options.style}` : ''}
      
      Include:
      - Detailed hook (first 30 seconds)
      - Section-by-section breakdown
      - Transition phrases
      - Call-to-action segments
      - Engagement prompts`;

      const scriptResponse = await agent.generate(scriptPrompt);
      
      yield {
        workflowId,
        step: 'Script generation completed',
        progress: 95,
        status: 'running',
        result: {
          type: 'detailed_script',
          content: scriptResponse.text
        }
      };
    }

    yield {
      workflowId,
      step: 'Video content creation completed',
      progress: 100,
      status: 'completed',
      result: {
        content: contentResults,
        topic,
        options,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    yield {
      workflowId,
      step: 'Error in video content creation',
      progress: currentProgress,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Streaming Multi-Channel Competitive Analysis
export async function* runStreamingCompetitiveAnalysisWorkflow(
  targetChannelId: string,
  competitorChannelIds: string[],
  options?: {
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    focusAreas?: string[];
  },
  onProgress?: ProgressCallback
): AsyncGenerator<StreamingWorkflowProgress, void, unknown> {
  const workflowId = `competitive-analysis-${Date.now()}`;
  let currentProgress = 0;

  try {
    const analyzer = new StreamingChannelAnalyzer();
    const allChannels = [targetChannelId, ...competitorChannelIds];
    const channelAnalyses: Record<string, any[]> = {};

    yield {
      workflowId,
      step: 'Starting competitive analysis',
      progress: 5,
      status: 'running'
    };

    // Analyze each channel with streaming
    for (let i = 0; i < allChannels.length; i++) {
      const channelId = allChannels[i];
      const isTarget = channelId === targetChannelId;
      
      yield {
        workflowId,
        step: `Analyzing ${isTarget ? 'target' : 'competitor'} channel: ${channelId}`,
        progress: 5 + (i / allChannels.length) * 70,
        status: 'running'
      };

      const channelResults: any[] = [];
      for await (const analysis of analyzer.analyzeChannelStreaming(
        channelId,
        options?.analysisDepth || 'detailed'
      )) {
        channelResults.push(analysis);
        
        yield {
          workflowId,
          step: `${isTarget ? 'Target' : 'Competitor'} ${channelId}: ${analysis.stage}`,
          progress: 5 + (i / allChannels.length) * 70 + (analysis.completed ? 10 : 2),
          status: 'running',
          result: {
            channelId,
            isTarget,
            analysis
          }
        };
      }

      channelAnalyses[channelId] = channelResults;
    }

    // Generate comparative insights
    yield {
      workflowId,
      step: 'Generating competitive insights',
      progress: 80,
      status: 'running'
    };

    const competitiveAgent = await mastra.getAgent('channelAnalysis');
    const competitivePrompt = `Generate competitive analysis insights comparing target channel ${targetChannelId} against competitors ${competitorChannelIds.join(', ')}.
    
    Focus on:
    - Market positioning opportunities
    - Content gap analysis  
    - Performance benchmarking
    - Strategic recommendations
    ${options?.focusAreas ? `Special focus on: ${options.focusAreas.join(', ')}` : ''}`;

    const insights = await competitiveAgent.generate(competitivePrompt);

    yield {
      workflowId,
      step: 'Competitive analysis completed',
      progress: 100,
      status: 'completed',
      result: {
        targetChannel: targetChannelId,
        competitors: competitorChannelIds,
        channelAnalyses,
        competitiveInsights: insights.text,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    yield {
      workflowId,
      step: 'Error in competitive analysis',
      progress: currentProgress,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Workflow orchestrator for running multiple streaming workflows
export class StreamingWorkflowOrchestrator {
  private activeWorkflows: Map<string, AsyncGenerator> = new Map();
  private progressCallbacks: Map<string, ProgressCallback> = new Map();

  async startWorkflow(
    type: 'channelAnalysis' | 'videoCreation' | 'competitiveAnalysis',
    params: any,
    onProgress?: ProgressCallback
  ): Promise<string> {
    const workflowId = `${type}-${Date.now()}`;
    
    let workflow: AsyncGenerator<StreamingWorkflowProgress, void, unknown>;
    
    switch (type) {
      case 'channelAnalysis':
        workflow = runStreamingChannelAnalysisWorkflow(
          params.channelId,
          params.options,
          onProgress
        );
        break;
      case 'videoCreation':
        workflow = runStreamingVideoCreationWorkflow(
          params.topic,
          params.options,
          onProgress
        );
        break;
      case 'competitiveAnalysis':
        workflow = runStreamingCompetitiveAnalysisWorkflow(
          params.targetChannelId,
          params.competitorChannelIds,
          params.options,
          onProgress
        );
        break;
      default:
        throw new Error(`Unknown workflow type: ${type}`);
    }

    this.activeWorkflows.set(workflowId, workflow);
    if (onProgress) {
      this.progressCallbacks.set(workflowId, onProgress);
    }

    return workflowId;
  }

  async *getWorkflowProgress(workflowId: string): AsyncGenerator<StreamingWorkflowProgress, void, unknown> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    try {
      for await (const progress of workflow) {
        yield progress;
        
        if (progress.status === 'completed' || progress.status === 'error') {
          this.activeWorkflows.delete(workflowId);
          this.progressCallbacks.delete(workflowId);
          break;
        }
      }
    } catch (error) {
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);
      throw error;
    }
  }

  getActiveWorkflows(): string[] {
    return Array.from(this.activeWorkflows.keys());
  }

  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      // Clean up
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);
      return true;
    }
    return false;
  }
}