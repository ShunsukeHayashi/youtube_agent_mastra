import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

/* ------------------------------------------------------------------ *
 * 0. 共有リソース
 * ------------------------------------------------------------------ */
const llm = openai('gpt-4o');

/* ------------------------------------------------------------------ *
 * 1. ステップ定義
 * ------------------------------------------------------------------ */

/** 1-a. 入力検証 */
const validateContentScoringInputStep = createStep({
  id: 'validate-content-scoring-input',
  description: 'Validate input for content scoring',
  inputSchema: z.object({
    contentUrl: z.string(),
    contentType: z.string(),
    targetAudience: z.string(),
    contentGoals: z.array(z.string()),
    contentScript: z.string().optional(),
    contentDescription: z.string().optional(),
    specificFeedbackAreas: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    validatedInput: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ input }) => {
    const required = ['contentUrl', 'contentType', 'targetAudience', 'contentGoals'] as const;
    for (const k of required) {
      if (!input[k] || (Array.isArray(input[k]) && input[k].length === 0)) {
        return { isValid: false, message: `${k} は必須です` };
      }
    }
    return { isValid: true, validatedInput: input };
  },
});

/** 1-b. コンテンツ分析 */
const analyzeContentStep = createStep({
  id: 'analyze-content',
  description: 'Analyze the YouTube content and produce scores',
  inputSchema: z.object({
    validatedInput: validateContentScoringInputStep.outputSchema.shape.validatedInput,
  }),
  outputSchema: z.object({
    contentAnalysis: z.any(),
  }),
  execute: async ({ input }) => {
    const { validatedInput } = input;

    const analysisAgent = new Agent({
      name: 'Content Analysis Expert',
      model: llm,
      instructions: 'あなたは YouTube コンテンツの分析専門家です。',
    });

    // TODO: 実装時は analysisAgent から得た文字列をパース
    await analysisAgent.execute(
      `## 分析対象URL\n${validatedInput.contentUrl}\n## タイプ\n${validatedInput.contentType}`
    );

    return {
      contentAnalysis: {
        overallImpression: '良好',
        categoryScores: {
          structure: { score: 7, strengths: [], weaknesses: [] },
          delivery: { score: 8, strengths: [], weaknesses: [] },
          engagement: { score: 6, strengths: [], weaknesses: [] },
          seo: { score: 5, strengths: [], weaknesses: [] },
          production: { score: 8, strengths: [], weaknesses: [] },
        },
        audienceAlignment: { score: 7, analysis: '' },
        goalAchievement: { score: 6, analysis: '' },
      },
    };
  },
});

/** 1-c. フィードバック生成 */
const generateFeedbackStep = createStep({
  id: 'generate-feedback',
  description: 'Generate feedback & suggestions',
  inputSchema: z.object({
    validatedInput: validateContentScoringInputStep.outputSchema.shape.validatedInput,
    contentAnalysis: analyzeContentStep.outputSchema.shape.contentAnalysis,
  }),
  outputSchema: z.object({
    feedback: z.any(),
  }),
  execute: async ({ input }) => {
    const feedbackAgent = new Agent({
      name: 'Feedback Expert',
      model: llm,
      instructions: 'あなたは改善提案の専門家です。',
    });

    await feedbackAgent.execute(
      `## 分析結果\n${JSON.stringify(input.contentAnalysis, null, 2)}`
    );

    return {
      feedback: {
        overallScore: 7.0,
        summary: '全体的に良好ですが、SEO と CTA を改善できます。',
        detailedFeedback: {},
        topStrengths: [],
        topWeaknesses: [],
        improvementSuggestions: [],
        nextLevelStrategies: [],
      },
    };
  },
});

/** 1-d. レポート生成 */
const generateScoringReportStep = createStep({
  id: 'generate-scoring-report',
  description: 'Create final scoring report',
  inputSchema: z.object({
    validatedInput: validateContentScoringInputStep.outputSchema.shape.validatedInput,
    contentAnalysis: analyzeContentStep.outputSchema.shape.contentAnalysis,
    feedback: generateFeedbackStep.outputSchema.shape.feedback,
  }),
  outputSchema: z.object({
    scoringReport: z.any(),
  }),
  execute: async ({ input }) => {
    const { contentAnalysis, feedback, validatedInput } = input;

    return {
      scoringReport: {
        title: `コンテンツスコアリングレポート: ${validatedInput.contentUrl}`,
        contentSummary: {
          contentUrl: validatedInput.contentUrl,
          contentType: validatedInput.contentType,
          targetAudience: validatedInput.targetAudience,
          contentGoals: validatedInput.contentGoals,
        },
        scorecard: {
          overallScore: feedback.overallScore,
          categoryScores: Object.fromEntries(
            Object.entries(contentAnalysis.categoryScores).map(([k, v]) => [k, v.score])
          ),
          visualizationData: '※フロントエンドでレーダーチャートを描画してください',
        },
        strengthsAndWeaknesses: {
          topStrengths: feedback.topStrengths,
          topWeaknesses: feedback.topWeaknesses,
        },
        detailedAnalysis: {},
        improvementPlan: {},
        conclusionAndNextSteps: '次の動画では CTA を明確にしましょう',
      },
    };
  },
});

/* ------------------------------------------------------------------ *
 * 2. ワークフロー定義
 * ------------------------------------------------------------------ */
export const youtubeContentScoringWorkflow = createWorkflow({
  id: 'youtube-content-scoring-workflow',
  description: 'YouTube コンテンツの品質評価とフィードバックを提供するワークフロー',
  inputSchema: validateContentScoringInputStep.inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      scoringReport: generateScoringReportStep.outputSchema.shape.scoringReport,
    }).optional(),
  }),
})
  .then(validateContentScoringInputStep)
  .then(analyzeContentStep)
  .then(generateFeedbackStep)
  .then(generateScoringReportStep)
  .commit(); // ★ commit をチェーンの最後に 1 回だけ呼び出す

/* ------------------------------------------------------------------ *
 * 3. 必要な個別エクスポート
 * ------------------------------------------------------------------ */
export {
  validateContentScoringInputStep,
  analyzeContentStep,
  generateFeedbackStep,
  generateScoringReportStep,
};
