// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * WORKFLOW-Osaru: インタビュー対話形式の長尺スクリプト生成
 */

// Step1: 入力検証
const validateOsaruInput = createStep({
  id: 'validate-osaru-input',
  description: 'Validate persona and topic information',
  inputSchema: z.object({
    expertPersona: z.string().describe('専門家役のペルソナ'),
    interviewerPersona: z.string().describe('質問者役のペルソナ'),
    topic: z.string().describe('対話テーマ'),
    lengthMinutes: z.number().min(10).default(15).describe('想定尺(分)'),
    style: z.string().optional().describe('トーンやスタイル'),
    ctaGoal: z.string().optional().describe('エンディングで促す行動'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    validatedInput: z.object({
      expertPersona: z.string(),
      interviewerPersona: z.string(),
      topic: z.string(),
      lengthMinutes: z.number(),
      style: z.string().optional(),
      ctaGoal: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ input }) => {
    if (!input.expertPersona || !input.interviewerPersona || !input.topic) {
      return { isValid: false };
    }
    const lengthMinutes = input.lengthMinutes || 15;
    return { isValid: true, validatedInput: { ...input, lengthMinutes } };
  },
});

// Step2: Q&Aセクション生成
const generateOsaruQA = createStep({
  id: 'generate-osaru-qa',
  description: 'Generate Q&A sections for the interview',
  inputSchema: z.object({
    validatedInput: z.object({
      expertPersona: z.string(),
      interviewerPersona: z.string(),
      topic: z.string(),
      lengthMinutes: z.number(),
      style: z.string().optional(),
      ctaGoal: z.string().optional(),
    }),
  }),
  outputSchema: z.object({
    sections: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
  execute: async ({ input }) => {
    const { expertPersona, interviewerPersona, topic } = input.validatedInput;
    const qaAgent = new Agent({
      name: 'Osaru QA Generator',
      model: llm,
      instructions: `あなたは${expertPersona}と${interviewerPersona}の対話台本を作成するアシスタントです。テーマ「${topic}」について3〜5問のQ&Aを作成してください。`,
    });
    const result = await qaAgent.execute('Q&Aを生成してください');
    // 実装例では固定データを返す
    const sections = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
      { question: 'Q3', answer: 'A3' },
    ];
    return { sections };
  },
});

// Step3: CTA付きエンディング生成
const generateOsaruCTA = createStep({
  id: 'generate-osaru-cta',
  description: 'Generate closing summary and CTA',
  inputSchema: z.object({
    validatedInput: z.object({
      expertPersona: z.string(),
      interviewerPersona: z.string(),
      topic: z.string(),
      lengthMinutes: z.number(),
      style: z.string().optional(),
      ctaGoal: z.string().optional(),
    }),
    sections: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  outputSchema: z.object({
    script: z.object({
      intro: z.string(),
      qa: z.array(z.object({ question: z.string(), answer: z.string() })),
      closing: z.string(),
    }),
  }),
  execute: async ({ input }) => {
    const { validatedInput, sections } = input;
    const closingAgent = new Agent({
      name: 'Osaru Closing Generator',
      model: llm,
      instructions: `テーマ「${validatedInput.topic}」のまとめとCTAを生成してください。`,
    });
    const closing = await closingAgent.execute('まとめとCTAを生成');
    return {
      script: {
        intro: `${validatedInput.interviewerPersona}が${validatedInput.expertPersona}にインタビューを開始します。`,
        qa: sections,
        closing: closing,
      },
    };
  },
});

// ワークフロー定義
const workflowLongformOsaru = createWorkflow({
  id: 'workflow-longform-osaru',
  description: 'インタビュー対話形式の長尺スクリプト生成',
  inputSchema: validateOsaruInput.inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    result: z.any().optional(),
  }),
})
  .then(validateOsaruInput)
  .then(generateOsaruQA)
  .then(generateOsaruCTA);

workflowLongformOsaru.commit();

export { workflowLongformOsaru };
