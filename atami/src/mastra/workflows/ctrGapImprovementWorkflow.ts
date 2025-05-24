import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { analyticsAdvisorAgent } from '../agents';

// Step1: モックでAnalytics取得
const fetchAnalytics = createStep({
  id: 'fetch-analytics',
  description: '動画のCTRやインプレッションを取得',
  inputSchema: z.object({
    video_id: z.string().describe('対象動画のYouTube ID'),
    category: z.string().optional().describe('ジャンル')
  }),
  outputSchema: z.object({
    ctr: z.number(),
    impressions: z.number(),
    avgViewDuration: z.number()
  }),
  execute: async () => {
    return { ctr: 2.8, impressions: 12000, avgViewDuration: 145 };
  }
});

// Step2: CTRギャップ診断
const ctrGapDiagnosis = createStep({
  id: 'ctr-gap-diagnosis',
  description: 'CTRが平均と比べてどの程度か判定',
  inputSchema: z.object({ ctr: z.number(), impressions: z.number() }),
  outputSchema: z.object({
    gapLevel: z.enum(['low', 'average', 'good']),
    reason: z.string()
  }),
  execute: async ({ context }) => {
    const { ctr } = context;
    if (ctr < 3.0) return { gapLevel: 'low', reason: 'CTRが平均以下です' };
    if (ctr < 5.0) return { gapLevel: 'average', reason: '平均水準ですが改善の余地あり' };
    return { gapLevel: 'good', reason: '高いCTRです' };
  }
});

// Step3: 改善提案
const improvementSuggestion = createStep({
  id: 'improvement-suggestion',
  description: 'CTR改善のためのタイトル案を提案',
  inputSchema: z.object({}),
  outputSchema: z.object({ message: z.string() }),
  execute: async (params) => {
    const analytics = params.context?.getStepResult(fetchAnalytics);
    const gap = params.context?.getStepResult(ctrGapDiagnosis);

    if (!analytics || !gap) {
      return { message: '十分なデータがありません' };
    }

    if (gap.gapLevel === 'good') {
      return { message: '改善の必要はありません' };
    }

    const prompt = `CTRが${analytics.ctr}%と低いため、動画タイトルの改善案を3つ提案してください。動画ジャンル：${params.context?.input.category ?? ''}`;
    const res = await analyticsAdvisorAgent.generate([{ role: 'user', content: prompt }]);
    return { message: res.text };
  }
});

export const youtubeCtrGapImprovementWorkflow = createWorkflow({
  id: 'youtube-ctr-gap-improvement-workflow',
  description: 'CTRギャップ診断とタイトル改善提案を行うワークフロー',
  inputSchema: z.object({
    video_id: z.string().describe('対象動画のYouTube ID'),
    category: z.string().optional().describe('ジャンル')
  }),
  outputSchema: z.object({
    ctr: z.number(),
    gapLevel: z.string(),
    reason: z.string(),
    message: z.string()
  })
})
  .then(fetchAnalytics)
  .then(ctrGapDiagnosis)
  .then(improvementSuggestion);

youtubeCtrGapImprovementWorkflow.commit();
