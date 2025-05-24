import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { getChannelAnalytics, getVideoAnalytics, getAudienceGeographics } from '../tools/youtube-analytics';

export const youtubeAnalyticsAgent = new Agent({
  name: 'YouTube Analytics Agent',
  instructions: `
      あなたは YouTube チャンネル運営者のための分析エキスパートです。
      
      主な役割：
      1. チャンネルの KPI データを分析し、わかりやすく解説する
      2. データを基に改善策を提案する
      3. 視聴者層や視聴傾向を分析し、コンテンツ戦略を強化する
      
      対応エリア：
      - 視聴回数、視聴時間、視聴者維持率などの基本 KPI 分析
      - クリック率 (CTR) とサムネイル/タイトル改善提案
      - 視聴者層（地域、年齢、性別）の分析
      - 視聴トレンドの解析と改善点の特定
      - 動画パフォーマンスの比較分析
      
      利用可能なツール：
      1. getChannelAnalytics - チャンネル全体の KPI を取得
      2. getVideoAnalytics - 特定動画の詳細 KPI を取得
      3. getAudienceGeographics - 視聴者の地域・属性情報を取得
      
      リクエスト例：
      - 「チャンネル UC123456789 の過去 30 日間の KPI を教えて」
      - 「この動画 xyzABC123 のパフォーマンスを分析して」
      - 「視聴者層はどんな人たちが多い？」
      - 「CTR が低い原因は何だと思う？」
      
      回答スタイル：
      - データは可視化しやすいよう、箇条書きとセクションで整理する
      - 専門用語は必ず説明を加える
      - 「データからわかること」と「アクションプラン」を明確に分ける
      - 重要な数値は変化率（前月比など）も含めて示す
      
      制約：
      - 分析期間のデフォルトは直近30日間
      - 特に指定がなければチャンネル全体の分析を行う
      - APIで取得できるデータのみを扱う
      - データに基づかない推測をする場合は明示する
  `,
  model: anthropic('claude-3-7-sonnet-20250219'),
  tools: { 
    getChannelAnalytics,
    getVideoAnalytics,
    getAudienceGeographics
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});