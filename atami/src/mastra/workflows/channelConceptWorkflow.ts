// @ts-nocheck - TypeScriptの型チェックを無効化
import { anthropic } from '@ai-sdk/anthropic';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeChannelConceptAgent } from '../agents/channelConceptAgent';
import { youtubeChannelConceptTool } from '../tools/channelConcept';

const llm = anthropic('claude-3-7-sonnet-20250219');

// チャンネルコンセプト生成ステップ
const generateChannelConcepts = createStep({
  id: 'generate-channel-concepts',
  description: 'Generate strategic YouTube channel concept proposals based on business information',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel (e.g., lead acquisition, brand awareness)'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    channelConceptAnalysis: z.any(),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      productInfo: string,
      targetAudience: string,
      serviceUrl?: string,
      businessGoals?: string,
      competitorChannels?: string[],
      industryCategory?: string,
      brandGuidelines?: string,
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    return await youtubeChannelConceptTool.execute({
      context: {
        productInfo: triggerData.productInfo,
        targetAudience: triggerData.targetAudience,
        serviceUrl: triggerData.serviceUrl,
        businessGoals: triggerData.businessGoals,
        competitorChannels: triggerData.competitorChannels,
        industryCategory: triggerData.industryCategory,
        brandGuidelines: triggerData.brandGuidelines,
      }
    });
  },
});

// コンセプト提案プレゼンテーションステップ
const presentConceptProposals = createStep({
  id: 'present-concept-proposals',
  description: 'Present the channel concept proposals in a structured format',
  inputSchema: z.object({}),
  outputSchema: z.object({
    channelConceptProposals: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const conceptResults = context?.getStepResult(generateChannelConcepts);

    if (!conceptResults) {
      throw new Error('Channel concept generation results not found');
    }

    const prompt = `以下のYouTubeチャンネルコンセプト分析データをもとに、戦略的なチャンネルコンセプト提案を30件提示してください：
      ${JSON.stringify(conceptResults, null, 2)}
    `;

    const response = await youtubeChannelConceptAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let proposalText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      proposalText += chunk;
    }

    return {
      channelConceptProposals: proposalText,
    };
  },
});

// バリデーションステップ
const validateChannelConceptInputStep = createStep({
  id: 'validate-channel-concept-input',
  description: 'Validate input for channel concept generation',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    message: z.string().optional(),
    validatedInput: z.object({
      productInfo: z.string(),
      targetAudience: z.string(),
      serviceUrl: z.string().optional(),
      businessGoals: z.string().optional(),
      competitorChannels: z.array(z.string()).optional(),
      industryCategory: z.string().optional(),
      brandGuidelines: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const input = context?.getStepResult('trigger');

    if (!input) {
      return {
        isValid: false,
        message: 'Input data not found',
      };
    }

    if (!input.productInfo) {
      return {
        isValid: false,
        message: 'Product information is required',
      };
    }

    if (!input.targetAudience) {
      return {
        isValid: false,
        message: 'Target audience is required',
      };
    }

    return {
      isValid: true,
      validatedInput: input,
    };
  },
});

// 新しいワークフロー定義
const youtubeChannelConceptWorkflow = createWorkflow({
  id: 'youtube-channel-concept-workflow',
  description: 'Generate strategic YouTube channel concept proposals based on business information',
  inputSchema: z.object({
    productInfo: z.string().describe('Detailed information about the product or service'),
    targetAudience: z.string().describe('Description of the target audience and their characteristics'),
    serviceUrl: z.string().optional().describe('URL of the service or business website'),
    businessGoals: z.string().optional().describe('Business goals for the YouTube channel (e.g., lead acquisition, brand awareness)'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    industryCategory: z.string().optional().describe('Industry or business category'),
    brandGuidelines: z.string().optional().describe('Brand guidelines or tone of voice'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      channelConceptAnalysis: z.any(),
      channelConceptProposals: z.string(),
    }).optional(),
  }),
})
  .then(validateChannelConceptInputStep)
  .then(generateChannelConcepts)
  .then(presentConceptProposals);

// ワークフローをコミット
youtubeChannelConceptWorkflow.commit();

export { youtubeChannelConceptWorkflow };