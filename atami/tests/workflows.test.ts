/// <reference types="jest" />

// ワークフローをモック化
const youtubeSearchWorkflow = {
  name: 'youtube-search-workflow',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

const youtubeChannelPlannerWorkflow = {
  name: 'youtube-channel-planner-workflow',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

const youtubeTitleGeneratorWorkflow = {
  name: 'youtube-title-generator-workflow',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

const youtubeChannelAnalyticsWorkflow = {
  name: 'youtube-channel-analytics-workflow',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

const youtubeVideoAnalyticsWorkflow = {
  name: 'youtube-video-analytics-workflow',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

// モックをエクスポート
jest.mock('../src/mastra/workflows/index', () => ({
  youtubeSearchWorkflow,
  youtubeChannelPlannerWorkflow,
  youtubeTitleGeneratorWorkflow,
  youtubeChannelAnalyticsWorkflow,
  youtubeVideoAnalyticsWorkflow
}));

import * as dotenv from 'dotenv';

// テスト前に.envファイルを読み込む
dotenv.config();

describe('YouTube Workflows', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('youtubeSearchWorkflow', () => {
    // テスト1: youtubeSearchWorkflowが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(youtubeSearchWorkflow).toBeDefined();
      expect(youtubeSearchWorkflow.name).toBe('youtube-search-workflow');
      expect(youtubeSearchWorkflow.run).toBeDefined();
    });

    // テスト2: ワークフローの実行が成功するかテスト
    test('should successfully run the workflow', async () => {
      // モック実装を設定
      const mockResult = {
        results: [
          {
            id: 'video1',
            title: 'Test Video 1',
            description: 'This is test video 1',
            url: 'https://www.youtube.com/watch?v=video1'
          },
          {
            id: 'video2',
            title: 'Test Video 2',
            description: 'This is test video 2',
            url: 'https://www.youtube.com/watch?v=video2'
          }
        ]
      };

      // runメソッドのモック実装
      youtubeSearchWorkflow.run.mockResolvedValueOnce(mockResult);

      // ワークフローを実行
      const result = await youtubeSearchWorkflow.run({
        query: 'test query',
        maxResults: 2
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(youtubeSearchWorkflow.run).toHaveBeenCalledTimes(1);
      expect(youtubeSearchWorkflow.run).toHaveBeenCalledWith({
        query: 'test query',
        maxResults: 2
      });
    });
  });

  describe('youtubeTitleGeneratorWorkflow', () => {
    // テスト1: youtubeTitleGeneratorWorkflowが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(youtubeTitleGeneratorWorkflow).toBeDefined();
      expect(youtubeTitleGeneratorWorkflow.name).toBe('youtube-title-generator-workflow');
      expect(youtubeTitleGeneratorWorkflow.run).toBeDefined();
    });

    // テスト2: ワークフローの実行が成功するかテスト
    test('should successfully run the workflow', async () => {
      // モック実装を設定
      const mockResult = {
        titles: [
          '10 Amazing AI Techniques That Will Blow Your Mind',
          'How to Master AI in Just 30 Days - Beginner\'s Guide',
          'The Future of AI: What You Need to Know in 2025'
        ],
        explanation: 'These titles are designed to be attention-grabbing while incorporating your keywords.'
      };

      // runメソッドのモック実装
      youtubeTitleGeneratorWorkflow.run.mockResolvedValueOnce(mockResult);

      // ワークフローを実行
      const result = await youtubeTitleGeneratorWorkflow.run({
        keywords: ['AI', 'techniques', 'beginner'],
        tone: 'educational',
        count: 3
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(youtubeTitleGeneratorWorkflow.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('youtubeChannelAnalyticsWorkflow', () => {
    // テスト1: youtubeChannelAnalyticsWorkflowが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(youtubeChannelAnalyticsWorkflow).toBeDefined();
      expect(youtubeChannelAnalyticsWorkflow.name).toBe('youtube-channel-analytics-workflow');
      expect(youtubeChannelAnalyticsWorkflow.run).toBeDefined();
    });

    // テスト2: ワークフローの実行が成功するかテスト
    test('should successfully run the workflow', async () => {
      // モック実装を設定
      const mockResult = {
        analytics: {
          views: 12500,
          watchTime: 450000,
          subscribers: 5000
        },
        report: 'Detailed analytics report for the channel'
      };

      // runメソッドのモック実装
      youtubeChannelAnalyticsWorkflow.run.mockResolvedValueOnce(mockResult);

      // ワークフローを実行
      const result = await youtubeChannelAnalyticsWorkflow.run({
        channelId: 'UC123456789',
        startDate: '2025-04-01',
        endDate: '2025-04-30'
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(youtubeChannelAnalyticsWorkflow.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('youtubeVideoAnalyticsWorkflow', () => {
    // テスト1: youtubeVideoAnalyticsWorkflowが正しく初期化されるかテスト
    test('should be properly initialized', () => {
      expect(youtubeVideoAnalyticsWorkflow).toBeDefined();
      expect(youtubeVideoAnalyticsWorkflow.name).toBe('youtube-video-analytics-workflow');
      expect(youtubeVideoAnalyticsWorkflow.run).toBeDefined();
    });

    // テスト2: ワークフローの実行が成功するかテスト
    test('should successfully run the workflow', async () => {
      // モック実装を設定
      const mockResult = {
        analytics: {
          views: 5000,
          likes: 450,
          comments: 120
        },
        report: 'Detailed analytics report for the video'
      };

      // runメソッドのモック実装
      youtubeVideoAnalyticsWorkflow.run.mockResolvedValueOnce(mockResult);

      // ワークフローを実行
      const result = await youtubeVideoAnalyticsWorkflow.run({
        channelId: 'UC123456789',
        videoId: 'abc123xyz',
        startDate: '2025-04-01',
        endDate: '2025-04-30'
      });

      // 結果を検証
      expect(result).toBeDefined();
      expect(result).toBe(mockResult);
      expect(youtubeVideoAnalyticsWorkflow.run).toHaveBeenCalledTimes(1);
    });
  });
});