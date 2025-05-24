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
    contentUrl: z.string().min(1, "contentUrl is required"),
    contentType: z.string().min(1, "contentType is required"),
    targetAudience: z.string().min(1, "targetAudience is required"),
    contentGoals: z.array(z.string()).min(1, "contentGoals must have at least one goal"),
    contentScript: z.string().optional(),
    contentDescription: z.string().optional(),
    specificFeedbackAreas: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    validatedInput: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const input = context?.getStepResult('trigger');
    if (!input) {
      return { isValid: false, message: 'Input data is missing' };
    }

    // Zodスキーマでパースして検証
    try {
      const validatedData = validateContentScoringInputStep.inputSchema.parse(input);
      return { isValid: true, validatedInput: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { isValid: false, message: `入力データが無効です: ${errors}` };
      }
      return { isValid: false, message: '入力データの検証中にエラーが発生しました' };
    }
  },
});

// analyzeContentStep が期待する入力の形状
const analyzeContentInputDataSchema = validateContentScoringInputStep.inputSchema;

// categoryScores の詳細な型を定義
const categoryScoreDetailSchema = z.object({
  score: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});
const categoryScoresSchema = z.record(z.string(), categoryScoreDetailSchema);

/** 1-b. コンテンツ分析 */
const analyzeContentStep = createStep({
  id: 'analyze-content',
  description: 'Analyze the YouTube content and produce scores',
  inputSchema: analyzeContentInputDataSchema,
  outputSchema: z.object({
    contentAnalysis: z.object({
        overallImpression: z.string(),
        categoryScores: categoryScoresSchema,
        audienceAlignment: z.object({ score: z.number(), analysis: z.string() }),
        goalAchievement: z.object({ score: z.number(), analysis: z.string() }),
      }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const validatedInputData = context?.getStepResult('validate-content-scoring-input');
    const validatedInput = validatedInputData?.validatedInput;
    if (!validatedInput) {
        throw new Error('Validated input not found in context for analyzeContentStep');
    }

    const analysisAgent = new Agent({
      name: 'Content Analysis Expert',
      model: llm,
      instructions: 'あなたは YouTube コンテンツの分析専門家です。提供された情報に基づいて、詳細な分析結果をJSON形式で返してください。分析項目は overallImpression (string), categoryScores (object with keys: structure, delivery, engagement, seo, production; each having score (number), strengths (string[]), weaknesses (string[])), audienceAlignment (object with score (number), analysis (string)), goalAchievement (object with score (number), analysis (string)) です。',
    });

    const agentResponse = await analysisAgent.generate([
      { role: "user", content: `以下のYouTubeコンテンツを分析してください:\n## 分析対象URL\n${validatedInput.contentUrl}\n## タイプ\n${validatedInput.contentType}\n## ターゲットオーディエンス\n${validatedInput.targetAudience}\n## コンテンツ目標\n${validatedInput.contentGoals.join(', ')}\n\n分析結果を指示されたJSON形式で出力してください。` }
    ]);
    const analysisResultText = agentResponse.text;

    try {
        const parsedAnalysis = JSON.parse(analysisResultText);
        return { contentAnalysis: parsedAnalysis };
    } catch (error) {
        console.error('Failed to parse content analysis from LLM response:', error);
        console.error('LLM Response Text:', analysisResultText);
        throw new Error('LLMからの分析結果のパースに失敗しました。');
    }
  },
});

/** 1-c. フィードバック生成 */
const generateFeedbackStep = createStep({
  id: 'generate-feedback',
  description: 'Generate feedback & suggestions',
  inputSchema: z.object({
    validatedInputData: analyzeContentInputDataSchema,
    currentContentAnalysis: analyzeContentStep.outputSchema.shape.contentAnalysis,
  }),
  outputSchema: z.object({
    feedback: z.object({
        overallScore: z.number(),
        summary: z.string(),
        detailedFeedback: z.record(z.string(), z.any()),
        topStrengths: z.array(z.string()),
        topWeaknesses: z.array(z.string()),
        improvementSuggestions: z.array(z.string()),
        nextLevelStrategies: z.array(z.string()),
    }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const validatedInputResult = context?.getStepResult('validate-content-scoring-input');
    const validatedInputData = validatedInputResult?.validatedInput;
    const analysisResult = context?.getStepResult('analyze-content');
    const currentContentAnalysis = analysisResult?.contentAnalysis;
    if (!currentContentAnalysis) {
        throw new Error('Content analysis not found for feedback generation');
    }

    const feedbackAgent = new Agent({
      name: 'Feedback Expert',
      model: llm,
      instructions: 'あなたは改善提案の専門家です。提供されたコンテンツ分析結果に基づいて、具体的で実行可能なフィードバックと改善提案をJSON形式で生成してください。フィードバック項目は overallScore (number, 1-10), summary (string), detailedFeedback (object), topStrengths (string[]), topWeaknesses (string[]), improvementSuggestions (string[]), nextLevelStrategies (string[]) です。',
    });

    const agentResponse = await feedbackAgent.generate([
      { role: "user", content: `以下のコンテンツ分析結果に基づいてフィードバックを生成してください:\n## 元の入力情報\n${JSON.stringify(validatedInputData, null, 2)}\n## 分析結果\n${JSON.stringify(currentContentAnalysis, null, 2)}\n\nフィードバックを指示されたJSON形式で出力してください。` }
    ]);
    const feedbackResultText = agentResponse.text;

    try {
        const parsedFeedback = JSON.parse(feedbackResultText);
        return { feedback: parsedFeedback };
    } catch (error) {
        console.error('Failed to parse feedback from LLM response:', error);
        console.error('LLM Response Text:', feedbackResultText);
        throw new Error('LLMからのフィードバックのパースに失敗しました。');
    }
  },
});

/** 1-d. レポート生成 */
const generateScoringReportStep = createStep({
  id: 'generate-scoring-report',
  description: 'Create final scoring report',
  inputSchema: z.object({
    initialInput: analyzeContentInputDataSchema,
    analysisResult: analyzeContentStep.outputSchema.shape.contentAnalysis,
    feedbackResult: generateFeedbackStep.outputSchema.shape.feedback,
  }),
  outputSchema: z.object({
    scoringReport: z.object({
      title: z.string(),
      contentSummary: z.object({
        contentUrl: z.string(),
        contentType: z.string(),
        targetAudience: z.string(),
        contentGoals: z.array(z.string())
      }),
      scorecard: z.object({
        overallScore: z.number(),
        categoryScores: z.record(z.string(), z.number()),
        visualizationData: z.string()
      }),
      strengthsAndWeaknesses: z.object({
        topStrengths: z.array(z.string()),
        topWeaknesses: z.array(z.string())
      }),
      detailedAnalysis: z.record(z.string(), z.any()),
      improvementPlan: z.record(z.string(), z.any()),
      conclusionAndNextSteps: z.string()
    }),
  }),
  execute: async (params) => {
    // @ts-ignore
    const context = params.context;
    const validatedInputResult = context?.getStepResult('validate-content-scoring-input');
    const initialInput = validatedInputResult?.validatedInput;
    const analysisStepResult = context?.getStepResult('analyze-content');
    const analysisResult = analysisStepResult?.contentAnalysis;
    const feedbackStepResult = context?.getStepResult('generate-feedback');
    const feedbackResult = feedbackStepResult?.feedback;

    if (!initialInput || !analysisResult || !feedbackResult) {
        throw new Error('Missing required data for report generation.');
    }

    const categoryScoresData = analysisResult.categoryScores || {};

    return {
      scoringReport: {
        title: `コンテンツスコアリングレポート: ${initialInput.contentUrl}`,
        contentSummary: {
          contentUrl: initialInput.contentUrl,
          contentType: initialInput.contentType,
          targetAudience: initialInput.targetAudience,
          contentGoals: initialInput.contentGoals,
        },
        scorecard: {
          overallScore: feedbackResult.overallScore,
          categoryScores: Object.fromEntries(
            Object.entries(categoryScoresData).map(([k, v]: [string, { score: number } | any]) =>
              [k, typeof v === 'object' && v !== null && 'score' in v ? v.score : 0]
            )
          ),
          visualizationData: '※フロントエンドでレーダーチャートを描画してください',
        },
        strengthsAndWeaknesses: {
          topStrengths: feedbackResult.topStrengths,
          topWeaknesses: feedbackResult.topWeaknesses,
        },
        detailedAnalysis: feedbackResult.detailedFeedback,
        improvementPlan: { suggestions: feedbackResult.improvementSuggestions },
        conclusionAndNextSteps: feedbackResult.nextLevelStrategies.join(' ') || '次の動画では CTA を明確にしましょう',
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
  .then(generateScoringReportStep);

// ワークフローをコミット
youtubeContentScoringWorkflow.commit();

/* ------------------------------------------------------------------ *
 * 3. 必要な個別エクスポート
 * ------------------------------------------------------------------ */
export {
  validateContentScoringInputStep,
  analyzeContentStep,
  generateFeedbackStep,
  generateScoringReportStep,
};