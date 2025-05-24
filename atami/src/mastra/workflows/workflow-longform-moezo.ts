// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * WORKFLOW-Moezo: モジュール解説形式の長尺スクリプト生成
 */

// Step1: 入力検証
const validateMoezoInput = createStep({
  id: 'validate-moezo-input',
  description: 'Validate topic and structure type',
  inputSchema: z.object({
    topic: z.string().describe('メインテーマ'),
    structureType: z.enum(['step', 'ranking']).describe('構造タイプ'),
    targetAudience: z.string().describe('ターゲット'),
    lengthMinutes: z.number().min(10).default(15).describe('想定尺(分)'),
    ctaGoal: z.string().optional().describe('CTA目的'),
    style: z.string().optional().describe('トーンやスタイル'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    validatedInput: z.object({
      topic: z.string(),
      structureType: z.enum(['step', 'ranking']),
      targetAudience: z.string(),
      lengthMinutes: z.number(),
      ctaGoal: z.string().optional(),
      style: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ input }) => {
    if (!input.topic) return { isValid: false };
    const lengthMinutes = input.lengthMinutes || 15;
    return { isValid: true, validatedInput: { ...input, lengthMinutes } };
  },
});

// Step2: セクション生成
const generateMoezoSections = createStep({
  id: 'generate-moezo-sections',
  description: 'Generate explanation blocks based on structure type',
  inputSchema: z.object({
    validatedInput: validateMoezoInput.outputSchema.shape.validatedInput,
  }),
  outputSchema: z.object({
    blocks: z.array(z.object({
      title: z.string(),
      body: z.string(),
    })),
  }),
  execute: async ({ input }) => {
    const { topic, structureType } = input.validatedInput;
    const blockAgent = new Agent({
      name: 'Moezo Block Generator',
      model: llm,
      instructions: `${topic} を${structureType}形式で解説するブロックを生成してください。`,
    });
    const result = await blockAgent.execute('ブロック生成');
    const blocks = [
      { title: 'Block1', body: '内容1' },
      { title: 'Block2', body: '内容2' },
      { title: 'Block3', body: '内容3' },
    ];
    return { blocks };
  },
});

// Step3: 統合 & テンプレ反映
const finalizeMoezo = createStep({
  id: 'finalize-moezo',
  description: 'Integrate blocks and append CTA',
  inputSchema: z.object({
    validatedInput: validateMoezoInput.outputSchema.shape.validatedInput,
    blocks: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  outputSchema: z.object({
    script: z.object({
      intro: z.string(),
      blocks: z.array(z.object({ title: z.string(), body: z.string() })),
      summary: z.string(),
      cta: z.string(),
    }),
  }),
  execute: async ({ input }) => {
    const { validatedInput, blocks } = input;
    const cta = validatedInput.ctaGoal || 'チャンネル登録をお願いします';
    return {
      script: {
        intro: `今回は「${validatedInput.topic}」を解説します。`,
        blocks,
        summary: '以上がポイントです。',
        cta,
      },
    };
  },
});

const workflowLongformMoezo = createWorkflow({
  id: 'workflow-longform-moezo',
  description: 'モジュール解説形式の長尺スクリプト生成',
  inputSchema: validateMoezoInput.inputSchema,
  outputSchema: z.object({ success: z.boolean(), result: z.any().optional() }),
})
  .then(validateMoezoInput)
  .then(generateMoezoSections)
  .then(finalizeMoezo);

workflowLongformMoezo.commit();

export { workflowLongformMoezo };
