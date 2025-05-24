import { createStep } from '@mastra/core';
import { z } from 'zod';

/**
 * Consistency evaluation step
 * Generates multiple results from a specified agent and evaluates their similarity.
 */
export const consistencyEvalStep = createStep({
  id: 'consistency-eval',
  description: '複数生成結果の構造的安定性を評価',
  inputSchema: z.object({
    agentId: z.string().describe('生成に使用するエージェントID'),
    basePrompt: z.string().describe('生成に使用するベースプロンプト'),
    repeat: z.number().default(3).describe('生成回数'),
  }),
  outputSchema: z.object({
    best: z.string(),
    similarityMatrix: z.array(z.array(z.number())),
    candidates: z.array(z.string()),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const input = context?.getStepResult('trigger');
    
    if (!input) {
      throw new Error('Input data not found');
    }

    // Note: This step requires access to Mastra instance to get agents
    // Currently simplified to return mock data
    const results: string[] = [];
    
    // Mock implementation - in real usage, would need to access agent through workflow context
    for (let i = 0; i < (input.repeat || 3); i++) {
      results.push(`Generated result ${i + 1} for: ${input.basePrompt}`);
    }

    const similarityMatrix = results.map(a =>
      results.map(b => 1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length))
    );

    const best = results[0];
    return { best, similarityMatrix, candidates: results };
  },
});
