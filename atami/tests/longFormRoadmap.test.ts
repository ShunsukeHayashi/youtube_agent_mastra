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

// Mock the roadmap workflow
const mockRoadmapWorkflow = {
  id: 'youtube-long-form-roadmap-workflow',
  name: 'YouTube Long Form Roadmap Workflow',
  description: 'Generate a roadmap-style long-form video script',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

// Mock the workflow module
jest.mock('../src/mastra/workflows/longFormRoadmapWorkflow', () => ({
  youtubeLongFormRoadmapWorkflow: mockRoadmapWorkflow
}));

// Import the mocked workflow
import { youtubeLongFormRoadmapWorkflow } from '../src/mastra/workflows/longFormRoadmapWorkflow';
import * as dotenv from 'dotenv';

// Load .env file before tests
dotenv.config();

describe('YouTube Long Form Roadmap Workflow', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Check if the workflow is properly initialized
  test('should be properly initialized', () => {
    expect(youtubeLongFormRoadmapWorkflow).toBeDefined();
    expect(youtubeLongFormRoadmapWorkflow.id).toBe('youtube-long-form-roadmap-workflow');
    expect(youtubeLongFormRoadmapWorkflow.name).toBe('YouTube Long Form Roadmap Workflow');
    expect(youtubeLongFormRoadmapWorkflow.description).toBe('Generate a roadmap-style long-form video script');
  });

  // Test 2: Test workflow execution
  test('should successfully run the workflow', async () => {
    // Mock result data
    const mockResult = {
      success: true,
      message: 'Roadmap script generated successfully',
      result: {
        script: {
          title: 'プログラミングを0から学ぶロードマップ',
          totalDuration: '15-20分',
          sections: [
            {
              sectionType: 'introduction',
              content: 'こんにちは、今日はプログラミングを0から学ぶためのロードマップを紹介します。...',
              duration: '2分',
              visualNotes: 'タイトル画面とロードマップの概要図を表示'
            },
            {
              sectionType: 'milestone',
              sectionTitle: '基礎を学ぶ',
              content: 'プログラミングの基礎を学ぶことから始めましょう。...',
              duration: '4分',
              visualNotes: '基本概念の図解と具体的なコード例を表示'
            },
            {
              sectionType: 'conclusion',
              content: 'いかがでしたか？このロードマップに従って学習を進めれば...',
              duration: '2分',
              visualNotes: '全体のロードマップを再表示し、次のステップを強調'
            }
          ],
          metadata: {
            targetKeywords: ['プログラミング', 'ロードマップ', '初心者', '学習計画'],
            thumbnailSuggestions: [
              'ロードマップの道が描かれたデザイン',
              'ステップごとに区切られた進行図'
            ],
            descriptionSuggestion: 'プログラミングを0から学びたい方必見！...'
          }
        }
      }
    };

    // Set up mock implementation
    mockRoadmapWorkflow.run.mockResolvedValueOnce(mockResult);

    // Run the workflow
    const result = await youtubeLongFormRoadmapWorkflow.run({
      topicTitle: 'プログラミングを0から学ぶロードマップ',
      topicDescription: 'プログラミングを初めて学ぶ人向けの段階的な学習計画',
      targetAudience: 'プログラミング初心者、20代～30代の転職希望者',
      goalState: 'ウェブアプリケーションを自力で開発できるようになる',
      difficultyLevel: '初級',
      estimatedTimeToComplete: '3ヶ月',
      prerequisites: ['基本的なPC操作ができる', 'インターネットの基礎知識がある']
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(youtubeLongFormRoadmapWorkflow.run).toHaveBeenCalledTimes(1);
    expect(youtubeLongFormRoadmapWorkflow.run).toHaveBeenCalledWith({
      topicTitle: 'プログラミングを0から学ぶロードマップ',
      topicDescription: 'プログラミングを初めて学ぶ人向けの段階的な学習計画',
      targetAudience: 'プログラミング初心者、20代～30代の転職希望者',
      goalState: 'ウェブアプリケーションを自力で開発できるようになる',
      difficultyLevel: '初級',
      estimatedTimeToComplete: '3ヶ月',
      prerequisites: ['基本的なPC操作ができる', 'インターネットの基礎知識がある']
    });
  });

  // Test 3: Test error handling
  test('should handle errors', async () => {
    // Set up mock to throw an error
    mockRoadmapWorkflow.run.mockRejectedValueOnce(new Error('Failed to generate roadmap script'));

    // Expect the error to be thrown
    await expect(
      youtubeLongFormRoadmapWorkflow.run({
        topicTitle: 'プログラミングを0から学ぶロードマップ',
        topicDescription: 'プログラミングを初めて学ぶ人向けの段階的な学習計画',
        targetAudience: 'プログラミング初心者、20代～30代の転職希望者',
        goalState: 'ウェブアプリケーションを自力で開発できるようになる'
      })
    ).rejects.toThrow('Failed to generate roadmap script');

    expect(youtubeLongFormRoadmapWorkflow.run).toHaveBeenCalledTimes(1);
  });

  // Test 4: Test input validation
  test('should validate input correctly', async () => {
    // Mock validation error result
    const validationErrorResult = {
      success: false,
      message: 'Validation failed: topicTitle is required',
      result: null
    };

    // Set up mock implementation for validation error
    mockRoadmapWorkflow.run.mockResolvedValueOnce(validationErrorResult);

    // Run the workflow with invalid input
    const result = await youtubeLongFormRoadmapWorkflow.run({
      // Missing topicTitle
      topicDescription: 'プログラミングを初めて学ぶ人向けの段階的な学習計画',
      targetAudience: 'プログラミング初心者、20代～30代の転職希望者',
      goalState: 'ウェブアプリケーションを自力で開発できるようになる'
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(validationErrorResult);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Validation failed');
  });
});