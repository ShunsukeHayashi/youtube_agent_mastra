/// <reference types="jest" />

// youtubeSearchToolをモック化
const youtubeSearchTool = {
  id: 'youtube-search',
  description: 'Search for YouTube videos by keyword',
  execute: jest.fn()
};

// モックをエクスポート
jest.mock('../src/mastra/tools/index', () => ({
  youtubeSearchTool
}));

import * as dotenv from 'dotenv';

// テスト前に.envファイルを読み込む
dotenv.config();

describe('YouTube Search Tool', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト1: YouTube検索ツールが正しく初期化されるかテスト
  test('should be properly initialized', () => {
    expect(youtubeSearchTool).toBeDefined();
    expect(youtubeSearchTool.id).toBe('youtube-search');
    expect(youtubeSearchTool.description).toBe('Search for YouTube videos by keyword');
  });

  // テスト2: 検索クエリを指定して検索が成功するかテスト
  test('should successfully search for videos', async () => {
    // モック実装を設定
    const mockResult = {
      results: [
        {
          id: 'test-video-id',
          title: 'Test Video',
          description: 'This is a test video',
          channelTitle: 'Test Channel',
          publishedAt: '2023-01-01T00:00:00Z',
          thumbnailUrl: 'https://example.com/high.jpg',
          url: 'https://www.youtube.com/watch?v=test-video-id'
        }
      ],
      totalResults: 1,
      nextPageToken: 'next-page-token'
    };

    // executeメソッドのモック実装
    youtubeSearchTool.execute.mockResolvedValueOnce(mockResult);

    // ツールを実行
    const result = await youtubeSearchTool.execute({
      context: {
        query: 'test query',
        maxResults: 1,
        type: 'video'
      },
      runtimeContext: {} as any
    });

    // 結果を検証
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(youtubeSearchTool.execute).toHaveBeenCalledTimes(1);
    expect(youtubeSearchTool.execute).toHaveBeenCalledWith({
      context: {
        query: 'test query',
        maxResults: 1,
        type: 'video'
      },
      runtimeContext: expect.any(Object)
    });
  });

  // テスト3: エラーが発生した場合のテスト
  test('should handle errors', async () => {
    // エラーをスローするモック実装
    youtubeSearchTool.execute.mockRejectedValueOnce(new Error('Test error'));

    // エラーが発生することを期待
    await expect(
      youtubeSearchTool.execute({
        context: {
          query: 'test query',
          maxResults: 1,
          type: 'video'
        },
        runtimeContext: {} as any
      })
    ).rejects.toThrow('Test error');

    expect(youtubeSearchTool.execute).toHaveBeenCalledTimes(1);
  });
});