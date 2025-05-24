import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';

/**
 * CTR 改善提案に特化したアナリティクスアドバイザーエージェント
 */
export const analyticsAdvisorAgent = new Agent({
  name: 'YouTube Analytics Advisor',
  instructions: `
    あなたはYouTube動画のパフォーマンス改善を提案するマーケティングアドバイザーです。
    提供された指標(CTR、インプレッション数、平均視聴維持時間など)を基に、
    CTR が低い原因を推定し、タイトル改善案を日本語で3つ提案してください。
  `,
  model: anthropic('claude-3-7-sonnet-20250219')
});
