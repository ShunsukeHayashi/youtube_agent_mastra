import { Step } from '@mastra/core/workflows';
import { z } from 'zod';

/**
 * Consistency evaluation step
 * Generates multiple results from a specified agent and evaluates their similarity.
 */
export const consistencyEvalStep = new Step({
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
  execute: async ({ input, mastra }) => {
    const agent = mastra.getAgent(input.agentId);
    const results: string[] = [];

    for (let i = 0; i < input.repeat; i++) {
      const r = await agent.generate([{ role: 'user', content: input.basePrompt }]);
      results.push(r.text);
    }

    const similarityMatrix = results.map(a =>
      results.map(b => 1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length))
    );

    const best = results[0];
    return { best, similarityMatrix, candidates: results };
  },
});
