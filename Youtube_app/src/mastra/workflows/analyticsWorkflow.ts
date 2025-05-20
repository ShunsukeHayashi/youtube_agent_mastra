import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { getChannelAnalytics, getVideoAnalytics, getAudienceGeographics } from '../tools/youtube-analytics';

const llm = anthropic('claude-3-7-sonnet-20250219');

const analyticsAgent = new Agent({
  name: 'YouTube Analytics Strategist',
  model: llm,
  tools: { 
    getChannelAnalytics,
    getVideoAnalytics,
    getAudienceGeographics
  },
  instructions: `
    あなたは YouTube チャンネル運営者のための分析エキスパートです。

    分析データが提供されたら、以下のフォーマットで構造化した分析レポートを作成してください：

    ## 📊 分析レポート: [チャンネル名/動画タイトル]
    
    ### 📈 基本 KPI サマリー
    - 総視聴回数: [数値] ([前期間比 %])
    - 平均視聴時間: [数値] 分/秒 ([前期間比 %])
    - 総視聴時間: [数値] 時間 ([前期間比 %])
    - 平均 CTR: [数値]% ([前期間比 %])
    
    ### 📅 日別トレンド分析
    - ピーク日: [日付] - [視聴回数]回
    - 最低日: [日付] - [視聴回数]回
    - トレンド傾向: [上昇/下降/安定]
    
    ### 👥 視聴者分析（提供されている場合）
    - 主要地域: [地域1]([%]), [地域2]([%]), [地域3]([%])
    - 年齢層: [主要年齢層] が [%]
    - 性別比: [男性/女性/非公開] [%]
    
    ### 🔍 パフォーマンス診断
    - 強み: [箇条書きで3つ]
    - 改善点: [箇条書きで3つ]
    - 特記すべき傾向: [特筆すべき傾向]
    
    ### 📝 改善アクションプラン
    1. [具体的なアクション1]
    2. [具体的なアクション2]
    3. [具体的なアクション3]
    
    ### 📘 ベンチマーク
    - 業界平均との比較: [上回る/下回る/同等]
    - トップチャンネル対比: [%]
    
    ### 🔮 次回フォーカス提案
    - [次回重点的に見るべき指標や実験すべき要素]

    レポートは客観的なデータに基づき、明確なアクション提案を含めて作成してください。用語解説も必要に応じて入れること。
  `
});

// Channel Analytics Workflow
const fetchChannelAnalytics = new Step({
  id: 'fetch-channel-analytics',
  description: 'チャンネルの KPI データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('分析対象のチャンネル ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
    dimensions: z.string().optional().describe('分析単位 (day/month など)'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      channelId: string,
      startDate?: string,
      endDate?: string,
      metrics?: string[],
      dimensions?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    return await getChannelAnalytics.execute({
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        metrics: triggerData.metrics,
        dimensions: triggerData.dimensions,
      }
    });
  },
});

const fetchAudienceData = new Step({
  id: 'fetch-audience-data',
  description: 'チャンネル視聴者の属性データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('分析対象のチャンネル ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      channelId: string,
      startDate?: string,
      endDate?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    const geoData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'country',
      }
    });
    
    const ageData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'ageGroup',
      }
    });
    
    const genderData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'gender',
      }
    });
    
    return {
      geography: geoData,
      age: ageData,
      gender: genderData,
    };
  },
});

const generateAnalyticsReport = new Step({
  id: 'generate-analytics-report',
  description: 'KPI データと視聴者データを元に分析レポートを生成',
  execute: async ({ context, mastra }) => {
    const channelData = context?.getStepResult(fetchChannelAnalytics);
    const audienceData = context?.getStepResult(fetchAudienceData);
    
    if (!channelData) {
      throw new Error('Channel analytics data not found');
    }
    
    const prompt = `以下の YouTube チャンネル分析データをもとに、戦略的な分析レポートを作成してください。

    チャンネル KPI データ:
    ${JSON.stringify(channelData, null, 2)}
    
    ${audienceData ? `視聴者属性データ:
    ${JSON.stringify(audienceData, null, 2)}` : '視聴者属性データは利用できません。'}
    
    このデータから、チャンネルの現状分析、改善点、具体的なアクションプランを含む詳細なレポートを作成してください。`;
    
    const response = await analyticsAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let reportText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      reportText += chunk;
    }
    
    return {
      report: reportText,
    };
  },
});

// Video Analytics Workflow
const fetchVideoAnalytics = new Step({
  id: 'fetch-video-analytics',
  description: '特定動画の詳細 KPI データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('チャンネル ID'),
    videoId: z.string().describe('分析対象の動画 ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      channelId: string,
      videoId: string,
      startDate?: string,
      endDate?: string,
      metrics?: string[],
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    return await getVideoAnalytics.execute({
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        metrics: triggerData.metrics,
      }
    });
  },
});

const fetchVideoAudienceData = new Step({
  id: 'fetch-video-audience-data',
  description: '特定動画の視聴者属性データを取得',
  inputSchema: z.object({
    channelId: z.string().describe('チャンネル ID'),
    videoId: z.string().describe('分析対象の動画 ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      channelId: string,
      videoId: string,
      startDate?: string,
      endDate?: string,
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    const geoData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'country',
      }
    });
    
    const ageData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'ageGroup',
      }
    });
    
    const genderData = await getAudienceGeographics.execute({
      context: {
        channelId: triggerData.channelId,
        videoId: triggerData.videoId,
        startDate: triggerData.startDate,
        endDate: triggerData.endDate,
        dimensions: 'gender',
      }
    });
    
    return {
      geography: geoData,
      age: ageData,
      gender: genderData,
    };
  },
});

const generateVideoReport = new Step({
  id: 'generate-video-report',
  description: '動画 KPI データと視聴者データを元に分析レポートを生成',
  execute: async ({ context, mastra }) => {
    const videoData = context?.getStepResult(fetchVideoAnalytics);
    const audienceData = context?.getStepResult(fetchVideoAudienceData);
    
    if (!videoData) {
      throw new Error('Video analytics data not found');
    }
    
    const prompt = `以下の YouTube 動画分析データをもとに、戦略的な分析レポートを作成してください。

    動画 KPI データ:
    ${JSON.stringify(videoData, null, 2)}
    
    ${audienceData ? `視聴者属性データ:
    ${JSON.stringify(audienceData, null, 2)}` : '視聴者属性データは利用できません。'}
    
    このデータから、動画のパフォーマンス分析、改善点、次回動画への具体的なアクションプランを含む詳細なレポートを作成してください。`;
    
    const response = await analyticsAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let reportText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      reportText += chunk;
    }
    
    return {
      report: reportText,
    };
  },
});

const youtubeChannelAnalyticsWorkflow = new Workflow({
  name: 'youtube-channel-analytics-workflow',
  triggerSchema: z.object({
    channelId: z.string().describe('分析対象のチャンネル ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
    dimensions: z.string().optional().describe('分析単位 (day/month など)'),
  }),
})
  .step(fetchChannelAnalytics)
  .then(fetchAudienceData)
  .then(generateAnalyticsReport);

const youtubeVideoAnalyticsWorkflow = new Workflow({
  name: 'youtube-video-analytics-workflow',
  triggerSchema: z.object({
    channelId: z.string().describe('チャンネル ID'),
    videoId: z.string().describe('分析対象の動画 ID'),
    startDate: z.string().optional().describe('分析開始日 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('分析終了日 (YYYY-MM-DD)'),
    metrics: z.array(z.string()).optional().describe('取得する指標のリスト'),
  }),
})
  .step(fetchVideoAnalytics)
  .then(fetchVideoAudienceData)
  .then(generateVideoReport);

youtubeChannelAnalyticsWorkflow.commit();
youtubeVideoAnalyticsWorkflow.commit();

export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow };