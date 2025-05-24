import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { render } from '../lib/render';

const llm = anthropic('claude-3-7-sonnet-20250219');

const scriptGeneratorAgent = new Agent({
  name: 'Video Script Generator',
  model: llm,
});

// スクリプト生成ステップ
const generateScriptStep = createStep({
  id: 'generate-video-script',
  description: 'Generate video script using Jinja2 template',
  inputSchema: z.object({
    topic: z.string(),
    targetPersona: z.string(),
    videoType: z.string(),
    tone: z.string(),
    structure: z.string(),
    segmentCount: z.number(),
    durationMinutes: z.number(),
    totalWords: z.number(),
  }),
  outputSchema: z.object({
    script: z.string(),
  }),
  execute: async ({ input }) => {
    const prompt = render('script_generator', {
      topic: input.topic,
      target_persona: input.targetPersona,
      video_type: input.videoType,
      tone: input.tone,
      structure: input.structure,
      segment_count: input.segmentCount,
      duration_minutes: input.durationMinutes,
      total_words: input.totalWords,
    });
    const { text } = await scriptGeneratorAgent.generate(prompt);
    return { script: text };
  },
});

const scriptGeneratorWorkflow = createWorkflow({
  id: 'script-generator-workflow',
  description: 'Generate YouTube script from standard template',
  inputSchema: generateScriptStep.inputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      script: z.string(),
    }).optional(),
  }),
})
  .then(generateScriptStep);

scriptGeneratorWorkflow.commit();

export { scriptGeneratorWorkflow };
