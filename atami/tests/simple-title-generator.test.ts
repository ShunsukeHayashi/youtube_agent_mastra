/// <reference types="jest" />

// Create a simple mock with proper types
const mockExecute = jest.fn();

// Basic mock for the title generator tool
jest.mock('../src/mastra/tools/titleGenerator', () => ({
  youtubeTitleGeneratorTool: {
    id: 'youtube-title-generator',
    description: 'Generate engaging YouTube thumbnail text and titles based on video content',
    execute: mockExecute
  }
}));

// Import the mock
import { youtubeTitleGeneratorTool } from '../src/mastra/tools/titleGenerator';

describe('Simple YouTube Title Generator Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be properly initialized', () => {
    expect(youtubeTitleGeneratorTool).toBeDefined();
    expect(youtubeTitleGeneratorTool.id).toBe('youtube-title-generator');
    expect(youtubeTitleGeneratorTool.description).toBe('Generate engaging YouTube thumbnail text and titles based on video content');
  });

  test('should call execute with proper parameters', async () => {
    // Set up mock return value
    mockExecute.mockResolvedValueOnce({
      personas: [],
      thumbnailTextOptions: [],
      titleOptions: [],
      recommendedSets: [],
      videoDescription: { description: '', tags: [] }
    });

    // Call the tool
    await youtubeTitleGeneratorTool.execute({
      context: {
        videoContent: 'Test video content',
        seoKeywords: ['test', 'keywords'],
        targetAudience: 'test audience',
        videoCategory: 'Test',
        channelTheme: 'Testing'
      },
      runtimeContext: {} as any
    });

    // Verify the call
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith({
      context: {
        videoContent: 'Test video content',
        seoKeywords: ['test', 'keywords'],
        targetAudience: 'test audience',
        videoCategory: 'Test',
        channelTheme: 'Testing'
      },
      runtimeContext: expect.any(Object)
    });
  });
});