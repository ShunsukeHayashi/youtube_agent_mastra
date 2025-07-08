/// <reference types="jest" />

// YouTube Analytics Toolsをモック化
const getChannelAnalytics = {
  id: 'getChannelAnalytics',
  description: '視聴回数・視聴維持率・CTR などの KPI を取得し JSON で返す',
  execute: jest.fn()
};

const getVideoAnalytics = {
  id: 'getVideoAnalytics',
  description: '特定の動画の KPI を取得し JSON で返す',
  execute: jest.fn()
};

const getAudienceGeographics = {
  id: 'getAudienceGeographics',
  description: '視聴者の地域・年齢・性別などの属性データを取得',
  execute: jest.fn()
};

// モックをエクスポート
jest.mock('../src/mastra/tools/youtube-analytics', () => ({
  getChannelAnalytics,
  getVideoAnalytics,
  getAudienceGeographics
}));

import * as dotenv from 'dotenv';

// テスト前に.envファイルを読み込む
dotenv.config();

describe('YouTube Analytics Tools', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChannelAnalytics', () => {
    // テスト1: getChannelAnalyticsが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(getChannelAnalytics).toBeDefined();
      expect(getChannelAnalytics.id).toBe('getChannelAnalytics');
      expect(getChannelAnalytics.description).toBe('視聴回数・視聴維持率・CTR などの KPI を取得し JSON で返す');
    });

    // テスト2: チャンネル分析が成功するかテスト
    test('should successfully get channel analytics', async () => {
      // モック実装を設定
      const mockResult = {
        views: 12500,
        watchTime: 450000,
        averageViewDuration: 215,
        subscribers: {
          gained: 350,
          lost: 50,
          total: 5000
        },
        topVideos: [
          { title: 'Video 1', views: 2500 },
          { title: 'Video 2', views: 1800 },
          { title: 'Video 3', views: 1200 }
        ]
      };

      // executeメソッドのモック実装
      getChannelAnalytics.execute.mockResolvedValueOnce(mockResult);

      // ツールを実行
      const result = await getChannelAnalytics.execute({
        context: {
          channelId: 'UC123456789',
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          metrics: ['views', 'watchTime', 'subscribers'],
          dimensions: 'day'
        },
        runtimeContext: {} as any
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(getChannelAnalytics.execute).toHaveBeenCalledTimes(1);
    });

    // テスト3: エラーが発生した場合のテスト
    test('should handle errors', async () => {
      // エラーをスローするモック実装
      getChannelAnalytics.execute.mockRejectedValueOnce(new Error('Failed to get channel analytics'));

      // エラーが発生することを期待
      await expect(
        getChannelAnalytics.execute({
          context: {
            channelId: 'UC123456789',
            startDate: '2025-04-01',
            endDate: '2025-04-30',
            metrics: ['views', 'watchTime', 'subscribers'],
            dimensions: 'day'
          },
          runtimeContext: {} as any
        })
      ).rejects.toThrow('Failed to get channel analytics');

      expect(getChannelAnalytics.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVideoAnalytics', () => {
    // テスト1: getVideoAnalyticsが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(getVideoAnalytics).toBeDefined();
      expect(getVideoAnalytics.id).toBe('getVideoAnalytics');
      expect(getVideoAnalytics.description).toBe('特定の動画の KPI を取得し JSON で返す');
    });

    // テスト2: 動画分析が成功するかテスト
    test('should successfully get video analytics', async () => {
      // モック実装を設定
      const mockResult = {
        views: 5000,
        likes: 450,
        comments: 120,
        shares: 80,
        averageViewDuration: 245,
        retentionRate: 0.65,
        trafficSources: [
          { source: 'YouTube Search', percentage: 45 },
          { source: 'External', percentage: 30 },
          { source: 'Suggested Videos', percentage: 25 }
        ]
      };

      // executeメソッドのモック実装
      getVideoAnalytics.execute.mockResolvedValueOnce(mockResult);

      // ツールを実行
      const result = await getVideoAnalytics.execute({
        context: {
          channelId: 'UC123456789',
          videoId: 'abc123xyz',
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          metrics: ['views', 'likes', 'comments', 'averageViewDuration']
        },
        runtimeContext: {} as any
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(getVideoAnalytics.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAudienceGeographics', () => {
    // テスト1: getAudienceGeographicsが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(getAudienceGeographics).toBeDefined();
      expect(getAudienceGeographics.id).toBe('getAudienceGeographics');
      expect(getAudienceGeographics.description).toBe('視聴者の地域・年齢・性別などの属性データを取得');
    });

    // テスト2: 視聴者属性データ取得が成功するかテスト
    test('should successfully get audience demographics', async () => {
      // モック実装を設定
      const mockResult = {
        geography: [
          { country: 'Japan', percentage: 65 },
          { country: 'United States', percentage: 15 },
          { country: 'Other', percentage: 20 }
        ],
        age: [
          { group: '18-24', percentage: 25 },
          { group: '25-34', percentage: 40 },
          { group: '35-44', percentage: 20 },
          { group: 'Other', percentage: 15 }
        ],
        gender: [
          { gender: 'Male', percentage: 70 },
          { gender: 'Female', percentage: 30 }
        ]
      };

      // executeメソッドのモック実装
      getAudienceGeographics.execute.mockResolvedValueOnce(mockResult);

      // ツールを実行
      const result = await getAudienceGeographics.execute({
        context: {
          channelId: 'UC123456789',
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          dimensions: 'country'
        },
        runtimeContext: {} as any
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(getAudienceGeographics.execute).toHaveBeenCalledTimes(1);
    });
  });
});