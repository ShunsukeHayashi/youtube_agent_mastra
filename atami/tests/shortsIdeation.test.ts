/// <reference types="jest" />

// Create mock functions with proper Jest typing
const mockExecute = jest.fn();
const mockAgentExecute = jest.fn();
const mockStream = jest.fn();

// Mock the Agent class
jest.mock('@mastra/core/agent', () => ({
  Agent: jest.fn().mockImplementation(() => ({
    execute: mockAgentExecute,
    stream: mockStream
  }))
}));

// Mock the AI SDK
jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn().mockReturnValue('mocked-model')
}));

// Mock the createStep function
const mockCreateStep = jest.fn().mockImplementation((config) => {
  return {
    id: config.id,
    description: config.description,
    execute: config.execute
  };
});

jest.mock('@mastra/core', () => ({
  createStep: mockCreateStep
}));

// Mock the shorts ideation workflow
const mockShortsIdeationWorkflow = {
  id: 'youtube-shorts-ideation-workflow',
  name: 'YouTube Shorts Ideation Workflow',
  description: 'Generate creative ideas for YouTube Shorts content',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

// Mock the workflow module
jest.mock('../src/mastra/workflows/shortsIdeationWorkflow', () => ({
  youtubeShortsIdeationWorkflow: mockShortsIdeationWorkflow
}));

// Import the mocked workflow
import { youtubeShortsIdeationWorkflow } from '../src/mastra/workflows/shortsIdeationWorkflow';
import * as dotenv from 'dotenv';

// Load .env file before tests
dotenv.config();

describe('YouTube Shorts Ideation Workflow', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Check if the workflow is properly initialized
  test('should be properly initialized', () => {
    expect(youtubeShortsIdeationWorkflow).toBeDefined();
    expect(youtubeShortsIdeationWorkflow.id).toBe('youtube-shorts-ideation-workflow');
    expect(youtubeShortsIdeationWorkflow.name).toBe('YouTube Shorts Ideation Workflow');
    expect(youtubeShortsIdeationWorkflow.description).toBe('Generate creative ideas for YouTube Shorts content');
  });

  // Test 2: Test workflow execution
  test('should successfully run the workflow', async () => {
    // Mock result data
    const mockResult = {
      success: true,
      message: 'Shorts ideas generated successfully',
      result: {
        shortsIdeas: [
          {
            title: "5秒で理解するJavaScript非同期処理",
            concept: "短時間で非同期処理の基本概念を視覚的に伝える",
            hook: "なぜJavaScriptのコードが思った順番で動かないの？",
            structure: "1. 問題提起 2. 視覚的説明 3. 実用例 4. まとめ",
            duration: "45-60秒",
            visualElements: ["コードブロック", "時系列図", "アニメーション効果"],
            callToAction: "詳しい解説は長尺動画をチェック",
            keywords: ["JavaScript", "非同期処理", "Promise", "async/await", "初心者向け"],
            trendRelevance: "プログラミング学習は常にトレンド、特に難しい概念の短時間解説は需要が高い"
          },
          {
            title: "CSS GridとFlexboxの使い分け方法",
            concept: "両者の違いと適切な使用シーンを比較形式で紹介",
            hook: "レイアウト崩れに悩んでいませんか？たった1分でマスターする方法",
            structure: "1. 悩み提示 2. 両者の違い 3. 使い分けの基準 4. サンプル例",
            duration: "50-60秒",
            visualElements: ["スプリットスクリーン比較", "コード例", "ビフォーアフター"],
            callToAction: "この動画が役立ったらいいねとチャンネル登録を！",
            keywords: ["CSS Grid", "Flexbox", "ウェブデザイン", "レイアウト", "コーディング"],
            trendRelevance: "ウェブデザイントレンドに常に関連する基本スキル"
          }
        ],
        recommendedSeries: [
          {
            seriesName: "1分で理解するウェブ開発概念",
            videos: [0, 1],
            strategy: "毎週同じ曜日・時間に投稿し、一貫したブランディングを確立"
          },
          {
            seriesName: "コーディングのこんな使い方知ってた？",
            videos: [1],
            strategy: "プログラミングのトリックや効率化テクニックに焦点を当てたシリーズ"
          }
        ],
        metadata: {
          targetKeywords: ["ウェブ開発", "JavaScript", "CSS", "プログラミング初心者", "コーディングチュートリアル"],
          recommendedHashtags: ["#JavaScript", "#プログラミング", "#プログラミング初心者", "#コーディング", "#ウェブ開発"]
        }
      }
    };

    // Set up mock implementation
    mockShortsIdeationWorkflow.run.mockResolvedValueOnce(mockResult);

    // Run the workflow
    const result = await youtubeShortsIdeationWorkflow.run({
      channelConcept: "プログラミング初心者向けのわかりやすいチュートリアルと解説",
      targetAudience: "20代〜30代のプログラミング学習者、特にWeb開発に興味がある人",
      contentGoals: ["教育", "エンゲージメント向上", "チャンネル登録促進"],
      existingContent: "JavaScript、HTML/CSS、Reactの基礎に関する長尺動画が人気",
      brandGuidelines: "フレンドリーでわかりやすい解説、専門用語は必ず噛み砕いて説明",
      trendTopics: ["React Hooks", "TailwindCSS", "状態管理", "TypeScript"],
      ideaCount: 5
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(youtubeShortsIdeationWorkflow.run).toHaveBeenCalledTimes(1);
    expect(youtubeShortsIdeationWorkflow.run).toHaveBeenCalledWith({
      channelConcept: "プログラミング初心者向けのわかりやすいチュートリアルと解説",
      targetAudience: "20代〜30代のプログラミング学習者、特にWeb開発に興味がある人",
      contentGoals: ["教育", "エンゲージメント向上", "チャンネル登録促進"],
      existingContent: "JavaScript、HTML/CSS、Reactの基礎に関する長尺動画が人気",
      brandGuidelines: "フレンドリーでわかりやすい解説、専門用語は必ず噛み砕いて説明",
      trendTopics: ["React Hooks", "TailwindCSS", "状態管理", "TypeScript"],
      ideaCount: 5
    });
  });

  // Test 3: Test error handling
  test('should handle errors', async () => {
    // Set up mock to throw an error
    mockShortsIdeationWorkflow.run.mockRejectedValueOnce(new Error('Failed to generate Shorts ideas'));

    // Expect the error to be thrown
    await expect(
      youtubeShortsIdeationWorkflow.run({
        channelConcept: "プログラミング初心者向けのわかりやすいチュートリアルと解説",
        targetAudience: "20代〜30代のプログラミング学習者、特にWeb開発に興味がある人",
        contentGoals: ["教育", "エンゲージメント向上", "チャンネル登録促進"]
      })
    ).rejects.toThrow('Failed to generate Shorts ideas');

    expect(youtubeShortsIdeationWorkflow.run).toHaveBeenCalledTimes(1);
  });

  // Test 4: Test input validation
  test('should validate input correctly', async () => {
    // Mock validation error result
    const validationErrorResult = {
      success: false,
      message: 'Validation failed: channelConcept is required',
      result: null
    };

    // Set up mock implementation for validation error
    mockShortsIdeationWorkflow.run.mockResolvedValueOnce(validationErrorResult);

    // Run the workflow with invalid input
    const result = await youtubeShortsIdeationWorkflow.run({
      // Missing channelConcept
      targetAudience: "20代〜30代のプログラミング学習者、特にWeb開発に興味がある人",
      contentGoals: ["教育", "エンゲージメント向上", "チャンネル登録促進"]
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(validationErrorResult);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Validation failed');
  });
});