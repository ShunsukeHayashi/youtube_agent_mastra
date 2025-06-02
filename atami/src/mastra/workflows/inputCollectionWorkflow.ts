/**
 * YouTube Input Collection Workflow
 * 
 * Collects initial input information for YouTube channel operations.
 */
import { anthropic } from '@ai-sdk/anthropic';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeInputCollectionAgent } from '../agents/inputCollectionAgent';
import { youtubeInputCollectionTool } from '../tools/inputCollection';
import { StepParams, YouTubeInputCollectionParams } from '../types/stepTypes';

const llm = anthropic('claude-3-7-sonnet-20250219');

// Step 1: Initial input collection
const collectInitialInput = createStep({
  id: 'collect-initial-input',
  description: 'Collect basic information for YouTube channel operation',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    presenterName: z.string().describe('Name of the presenter'),
    serviceUrl: z.string().optional().describe('URL of the service (if any)'),
    youtubeGoal: z.string().describe('Goal of YouTube operation (e.g., acquisition, awareness, fan building)'),
    presenterBackground: z.string().describe('Background and history of the presenter'),
  }),
  outputSchema: z.object({
    businessName: z.string(),
    presenterName: z.string(),
    serviceUrl: z.string().optional(),
    youtubeGoal: z.string(),
    presenterBackground: z.string(),
    recommendedWorkflows: z.array(z.string()),
  }),
  execute: async (params: StepParams<YouTubeInputCollectionParams>) => {
    const triggerData = params.context.getStepResult<YouTubeInputCollectionParams>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await youtubeInputCollectionTool.execute({
      context: {
        businessName: triggerData.businessName,
        presenterName: triggerData.presenterName,
        serviceUrl: triggerData.serviceUrl,
        youtubeGoal: triggerData.youtubeGoal,
        presenterBackground: triggerData.presenterBackground,
      }
    });
  },
});

// Step 2: Workflow recommendation
const recommendWorkflows = createStep({
  id: 'recommend-workflows',
  description: 'Recommend appropriate workflows based on collected input',
  inputSchema: z.object({
    businessName: z.string(),
    presenterName: z.string(),
    serviceUrl: z.string().optional(),
    youtubeGoal: z.string(),
    presenterBackground: z.string(),
    recommendedWorkflows: z.array(z.string()),
  }),
  outputSchema: z.object({
    businessName: z.string(),
    presenterName: z.string(),
    serviceUrl: z.string().optional(),
    youtubeGoal: z.string(),
    presenterBackground: z.string(),
    recommendedWorkflows: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      priority: z.number(),
    })),
    summary: z.string(),
  }),
  execute: async (params: StepParams) => {
    const collectResult = params.context.getStepResult<{
      businessName: string,
      presenterName: string,
      serviceUrl?: string,
      youtubeGoal: string,
      presenterBackground: string,
      recommendedWorkflows: string[],
    }>('collect-initial-input');

    if (!collectResult) {
      throw new Error('Collection result not found');
    }

    // Map workflow IDs to full workflow descriptions
    const workflowMap: Record<string, { name: string, description: string }> = {
      'WORKFLOW-1': {
        name: 'Channel Concept Design',
        description: 'Design YouTube channel concept and brand strategy',
      },
      'WORKFLOW-2': {
        name: 'Thumbnail & Title Generator',
        description: 'Generate optimized thumbnails and titles for videos',
      },
      'WORKFLOW-3': {
        name: 'Video Planning & SEO',
        description: 'Plan video content structure with SEO optimization',
      },
      'WORKFLOW-4': {
        name: 'Shorts Ideation',
        description: 'Generate creative ideas for YouTube Shorts content',
      },
      'WORKFLOW-5': {
        name: 'Shorts Script Research & Generation',
        description: 'Research and generate scripts for YouTube Shorts',
      },
      'WORKFLOW-6': {
        name: 'Content Scoring & Feedback',
        description: 'Score and provide feedback on existing content',
      },
      'WORKFLOW-7': {
        name: 'Long-Form TAIKI',
        description: 'Generate long-form content in TAIKI style',
      },
      'WORKFLOW-8': {
        name: 'Long-Form Roadmap',
        description: 'Create roadmap for long-form content creation',
      },
      'WORKFLOW-9': {
        name: 'Long-Form OSARU',
        description: 'Generate long-form content in OSARU style',
      },
      'WORKFLOW-10': {
        name: 'Long-Form MOEZO',
        description: 'Generate long-form content in MOEZO style',
      },
      'WORKFLOW-11': {
        name: 'Long-Form Conversation',
        description: 'Generate long-form conversation-style content',
      },
      'WORKFLOW-12': {
        name: 'Keyword Strategy Simulation',
        description: 'Simulate YouTube keyword strategy for content planning',
      },
      'WORKFLOW-13': {
        name: 'Initial Input Collection',
        description: 'Collect initial project information',
      },
    };

    // Build detailed workflow recommendations with priorities
    const detailedRecommendations = collectResult.recommendedWorkflows.map((workflowId, index) => {
      const workflowDetails = workflowMap[workflowId] || {
        name: workflowId,
        description: 'Custom workflow',
      };

      return {
        id: workflowId,
        name: workflowDetails.name,
        description: workflowDetails.description,
        priority: index + 1,
      };
    });

    // Generate a summary
    const promptWorkflowAgent = new Agent({
      name: 'Workflow Recommendation Agent',
      model: llm,
      instructions: `
        You are a YouTube workflow recommendation specialist.
        Based on the provided business information and goals, explain why certain workflows
        are recommended in a clear, concise summary.
        
        Your summary should:
        1. Acknowledge the business name and presenter
        2. Briefly mention their goal for YouTube
        3. Explain the logical order of the recommended workflows
        4. Provide a clear rationale for each recommendation
        
        Keep your response under 250 words and focus on being practical and helpful.
      `,
    });

    const workflowDescription = detailedRecommendations
      .map(wf => `${wf.id} (${wf.name}): ${wf.description}`)
      .join('\n');

    const summaryPrompt = `
      Business Name: ${collectResult.businessName}
      Presenter Name: ${collectResult.presenterName}
      Service URL: ${collectResult.serviceUrl || 'Not provided'}
      YouTube Goal: ${collectResult.youtubeGoal}
      Presenter Background: ${collectResult.presenterBackground}
      
      Recommended Workflows (in priority order):
      ${workflowDescription}
      
      Please provide a summary explaining why these workflows are recommended and how they align with the business goals.
    `;

    const summaryResult = await promptWorkflowAgent.execute(summaryPrompt);
    const summary = summaryResult.content.toString();

    return {
      businessName: collectResult.businessName,
      presenterName: collectResult.presenterName,
      serviceUrl: collectResult.serviceUrl,
      youtubeGoal: collectResult.youtubeGoal,
      presenterBackground: collectResult.presenterBackground,
      recommendedWorkflows: detailedRecommendations,
      summary,
    };
  },
});

// Workflow definition
const youtubeInputCollectionWorkflow = createWorkflow({
  id: 'youtube-input-collection-workflow',
  description: 'Collect initial input information for YouTube channel operations',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    presenterName: z.string().describe('Name of the presenter'),
    serviceUrl: z.string().optional().describe('URL of the service (if any)'),
    youtubeGoal: z.string().describe('Goal of YouTube operation (e.g., acquisition, awareness, fan building)'),
    presenterBackground: z.string().describe('Background and history of the presenter'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      businessName: z.string(),
      presenterName: z.string(),
      serviceUrl: z.string().optional(),
      youtubeGoal: z.string(),
      presenterBackground: z.string(),
      recommendedWorkflows: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        priority: z.number(),
      })),
      summary: z.string(),
    }).optional(),
  }),
})
  .then(collectInitialInput)
  .then(recommendWorkflows);

// Commit the workflow
youtubeInputCollectionWorkflow.commit();

// Export
export { youtubeInputCollectionWorkflow };