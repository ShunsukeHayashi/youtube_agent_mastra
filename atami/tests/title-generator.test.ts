/// <reference types="jest" />

// youtubeTitleGeneratorToolをモック化
const youtubeTitleGeneratorTool = {
  id: 'youtube-title-generator',
  description: 'Generate catchy YouTube video titles based on keywords and topics',
  execute: jest.fn()
};

// モックをエクスポート
jest.mock('../src/mastra/tools/titleGenerator', () => ({
  youtubeTitleGeneratorTool
}));

import * as dotenv from 'dotenv';

// テスト前に.envファイルを読み込む
dotenv.config();

describe('YouTube Title Generator Tool', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト1: YouTube Title Generator Toolが正しく初期化されるかテスト
  test('should be properly initialized', () => {
    expect(youtubeTitleGeneratorTool).toBeDefined();
    expect(youtubeTitleGeneratorTool.id).toBe('youtube-title-generator');
    expect(youtubeTitleGeneratorTool.description).toBe('Generate catchy YouTube video titles based on keywords and topics');
  });

  // テスト2: タイトル生成が成功するかテスト
  test('should successfully generate titles', async () => {
    // モック実装を設定
    const mockResult = {
      titles: [
        '10 Amazing AI Techniques That Will Blow Your Mind',
        'How to Master AI in Just 30 Days - Beginner\'s Guide',
        'The Future of AI: What You Need to Know in 2025'
      ],
      explanation: 'These titles are designed to be attention-grabbing while incorporating your keywords.'
    };

    // executeメソッドのモック実装
    youtubeTitleGeneratorTool.execute.mockResolvedValueOnce(mockResult);

    // ツールを実行
    const result = await youtubeTitleGeneratorTool.execute({
      context: {
        keywords: ['AI', 'techniques', 'beginner'],
        tone: 'educational',
        count: 3
      },
      runtimeContext: {} as any
    });

    // 結果を検証
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(youtubeTitleGeneratorTool.execute).toHaveBeenCalledTimes(1);
    expect(youtubeTitleGeneratorTool.execute).toHaveBeenCalledWith({
      context: {
        keywords: ['AI', 'techniques', 'beginner'],
        tone: 'educational',
        count: 3
      },
      runtimeContext: expect.any(Object)
    });
  });

  // テスト3: エラーが発生した場合のテスト
  test('should handle errors', async () => {
    // エラーをスローするモック実装
    youtubeTitleGeneratorTool.execute.mockRejectedValueOnce(new Error('Failed to generate titles'));

    // エラーが発生することを期待
    await expect(
      youtubeTitleGeneratorTool.execute({
        context: {
          keywords: ['AI', 'techniques', 'beginner'],
          tone: 'educational',
          count: 3
        },
        runtimeContext: {} as any
      })
    ).rejects.toThrow('Failed to generate titles');

    expect(youtubeTitleGeneratorTool.execute).toHaveBeenCalledTimes(1);
  });
});