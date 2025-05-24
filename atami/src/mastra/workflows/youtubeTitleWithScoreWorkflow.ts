import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeTitleGeneratorAgent } from '../agents/titleGeneratorAgent';

const generateTitles = createStep({
  id: 'generate-titles',
  description: 'Generate 10 candidate titles for the video',
  inputSchema: z.object({
    video_summary: z.string().describe('動画のあらすじ'),
    target_keyword: z.string().describe('SEO用キーワード'),
  }),
  outputSchema: z.array(z.string()),
  execute: async ({ context }) => {
    const input = context?.getStepResult<{ video_summary: string; target_keyword: string }>('trigger');
    if (!input) {
      throw new Error('Trigger data not found');
    }
    const prompt = `以下の動画内容とキーワードに基づいて、クリックを誘発するYouTubeタイトルを10案作成してください。\n\n【動画内容】${input.video_summary}\n【キーワード】${input.target_keyword}`;
    const response = await youtubeTitleGeneratorAgent.stream([
      { role: 'user', content: prompt },
    ]);

    const lines: string[] = [];
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      lines.push(chunk);
    }
    const text = lines.join('');
    return text.split('\n').map(t => t.trim()).filter(Boolean).slice(0, 10);
  },
});

const scoreTitles = createStep({
  id: 'score-titles',
  description: 'Score titles based on simple length heuristic',
  inputSchema: z.array(z.string()),
  outputSchema: z.array(z.object({ title: z.string(), score: z.number() })),
  execute: async ({ input }) => {
    return input
      .map(title => ({ title, score: Math.min(1.0, title.length / 35) }))
      .sort((a, b) => b.score - a.score);
  },
});

const youtubeTitleWithScoreWorkflow = createWorkflow({
  id: 'youtube-title-with-score-workflow',
  description: 'Generate YouTube titles and score them automatically',
  inputSchema: z.object({
    video_summary: z.string().describe('動画のあらすじ'),
    target_keyword: z.string().describe('SEO用キーワード'),
  }),
  outputSchema: z.object({
    scored_titles: z.array(z.object({ title: z.string(), score: z.number() })),
  }),
})
  .then(generateTitles)
  .then(scoreTitles);

youtubeTitleWithScoreWorkflow.commit();

export { youtubeTitleWithScoreWorkflow };
