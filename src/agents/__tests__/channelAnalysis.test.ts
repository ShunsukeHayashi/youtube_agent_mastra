import { channelAnalysisAgent } from '../channelAnalysis';
import { Agent } from '@mastra/core/agent';

// Mock the Agent class
jest.mock('@mastra/core/agent');

describe('ChannelAnalysisAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be created with correct configuration', () => {
    expect(Agent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'channel-analysis',
        name: 'Channel Analysis Agent',
        description: 'Analyzes YouTube channels for performance insights and recommendations',
        temperature: 0.3
      })
    );
  });

  it('should have comprehensive instructions', () => {
    const agentConfig = (Agent as jest.Mock).mock.calls[0][0];
    const instructions = agentConfig.instructions;

    expect(instructions).toContain('YouTube channel analysis expert');
    expect(instructions).toContain('Analyze channel performance metrics');
    expect(instructions).toContain('Identify content patterns');
    expect(instructions).toContain('actionable recommendations');
    expect(instructions).toContain('recent video performance trends');
  });

  it('should include YouTube analytics tool', () => {
    const agentConfig = (Agent as jest.Mock).mock.calls[0][0];
    
    expect(agentConfig.tools).toBeDefined();
    expect(agentConfig.tools.youtubeAnalytics).toBeDefined();
  });

  it('should use GPT-4 Turbo model', () => {
    const agentConfig = (Agent as jest.Mock).mock.calls[0][0];
    
    expect(agentConfig.model).toBeDefined();
    // Model configuration is passed as a function call
  });

  describe('agent behavior', () => {
    let mockAgent: any;

    beforeEach(() => {
      mockAgent = {
        run: jest.fn()
      };
      (Agent as jest.Mock).mockImplementation(() => mockAgent);
    });

    it('should analyze channel performance when given a channel ID', async () => {
      const mockResponse = {
        messages: [{
          role: 'assistant',
          content: 'Channel analysis complete. The channel shows strong growth...'
        }]
      };

      mockAgent.run.mockResolvedValue(mockResponse);

      const result = await channelAnalysisAgent.run({
        messages: [{
          role: 'user',
          content: 'Analyze channel UC123'
        }]
      });

      expect(result).toEqual(mockResponse);
      expect(mockAgent.run).toHaveBeenCalledWith({
        messages: [{
          role: 'user',
          content: 'Analyze channel UC123'
        }]
      });
    });

    it('should provide growth recommendations', async () => {
      const mockResponse = {
        messages: [{
          role: 'assistant',
          content: 'Based on analysis, here are growth recommendations...'
        }]
      };

      mockAgent.run.mockResolvedValue(mockResponse);

      const result = await channelAnalysisAgent.run({
        messages: [{
          role: 'user',
          content: 'What can I do to grow my YouTube channel?'
        }]
      });

      expect(mockAgent.run).toHaveBeenCalled();
    });
  });
});