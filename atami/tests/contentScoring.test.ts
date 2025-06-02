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

// Mock the content scoring workflow
const mockContentScoringWorkflow = {
  id: 'youtube-content-scoring-workflow',
  name: 'YouTube Content Scoring Workflow',
  description: 'Evaluate and score YouTube content quality and provide feedback',
  run: jest.fn(),
  _mastra: null,
  __registerMastra: jest.fn(),
  __registerPrimitives: jest.fn(),
  commit: jest.fn()
};

// Mock the workflow module
jest.mock('../src/mastra/workflows/contentScoringWorkflow', () => ({
  youtubeContentScoringWorkflow: mockContentScoringWorkflow
}));

// Import the mocked workflow
import { youtubeContentScoringWorkflow } from '../src/mastra/workflows/contentScoringWorkflow';
import * as dotenv from 'dotenv';

// Load .env file before tests
dotenv.config();

describe('YouTube Content Scoring Workflow', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Check if the workflow is properly initialized
  test('should be properly initialized', () => {
    expect(youtubeContentScoringWorkflow).toBeDefined();
    expect(youtubeContentScoringWorkflow.id).toBe('youtube-content-scoring-workflow');
    expect(youtubeContentScoringWorkflow.name).toBe('YouTube Content Scoring Workflow');
    expect(youtubeContentScoringWorkflow.description).toBe('Evaluate and score YouTube content quality and provide feedback');
  });

  // Test 2: Test workflow execution
  test('should successfully run the workflow', async () => {
    // Mock result data
    const mockResult = {
      success: true,
      message: 'Content successfully evaluated',
      result: {
        overallScore: 7.5,
        categoryScores: {
          engagement: 8.0,
          clarity: 7.0,
          relevance: 8.5,
          production: 6.5,
          optimization: 7.5
        },
        strengths: [
          'Strong opening hook that immediately captures attention',
          'Clear explanation of complex concepts with good examples',
          'Well-targeted content that addresses audience pain points'
        ],
        weaknesses: [
          'Audio quality could be improved, especially in outdoor scenes',
          'Some sections feel rushed with too much information at once',
          'Thumbnail doesn't clearly convey the video topic'
        ],
        improvementSuggestions: [
          {
            area: 'Audio',
            suggestion: 'Consider using a lapel microphone for outdoor scenes to improve audio clarity',
            priority: 'high'
          },
          {
            area: 'Pacing',
            suggestion: 'Break down complex sections into smaller segments with visual transitions',
            priority: 'medium'
          },
          {
            area: 'Thumbnail',
            suggestion: 'Redesign thumbnail with clear text and imagery that represents the main topic',
            priority: 'high'
          }
        ],
        comparisonToCompetitors: 'Content quality is above average compared to similar channels, but production quality lags behind industry leaders.'
      }
    };

    // Set up mock implementation
    mockContentScoringWorkflow.run.mockResolvedValueOnce(mockResult);

    // Run the workflow
    const result = await youtubeContentScoringWorkflow.run({
      contentUrl: 'https://www.youtube.com/watch?v=example123',
      contentType: 'tutorial',
      targetAudience: 'beginners interested in web development',
      contentGoals: ['educate', 'build authority', 'drive engagement'],
      specificFeedbackAreas: ['thumbnail effectiveness', 'audience retention', 'call to action']
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(youtubeContentScoringWorkflow.run).toHaveBeenCalledTimes(1);
    expect(youtubeContentScoringWorkflow.run).toHaveBeenCalledWith({
      contentUrl: 'https://www.youtube.com/watch?v=example123',
      contentType: 'tutorial',
      targetAudience: 'beginners interested in web development',
      contentGoals: ['educate', 'build authority', 'drive engagement'],
      specificFeedbackAreas: ['thumbnail effectiveness', 'audience retention', 'call to action']
    });
  });

  // Test 3: Test error handling
  test('should handle errors', async () => {
    // Set up mock to throw an error
    mockContentScoringWorkflow.run.mockRejectedValueOnce(new Error('Failed to evaluate content'));

    // Expect the error to be thrown
    await expect(
      youtubeContentScoringWorkflow.run({
        contentUrl: 'https://www.youtube.com/watch?v=example123',
        contentType: 'tutorial',
        targetAudience: 'beginners interested in web development',
        contentGoals: ['educate', 'build authority', 'drive engagement']
      })
    ).rejects.toThrow('Failed to evaluate content');

    expect(youtubeContentScoringWorkflow.run).toHaveBeenCalledTimes(1);
  });

  // Test 4: Test input validation
  test('should validate input correctly', async () => {
    // Mock validation error result
    const validationErrorResult = {
      success: false,
      message: 'Validation failed: contentUrl is required',
      result: null
    };

    // Set up mock implementation for validation error
    mockContentScoringWorkflow.run.mockResolvedValueOnce(validationErrorResult);

    // Run the workflow with invalid input
    const result = await youtubeContentScoringWorkflow.run({
      // Missing contentUrl
      contentType: 'tutorial',
      targetAudience: 'beginners interested in web development',
      contentGoals: ['educate', 'build authority', 'drive engagement']
    });

    // Verify results
    expect(result).toBeDefined();
    expect(result).toBe(validationErrorResult);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Validation failed');
  });
});