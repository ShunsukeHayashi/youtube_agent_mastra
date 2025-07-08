import { channelAnalysisWorkflow } from '../channelAnalysis';
import { Workflow } from '@mastra/core/workflows';

// Mock dependencies
jest.mock('@mastra/core/workflows');
jest.mock('../../agents/channelAnalysis');

describe('ChannelAnalysisWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be created with correct configuration', () => {
    expect(Workflow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'channel-analysis-workflow',
        name: 'Channel Analysis Workflow',
        description: 'Comprehensive YouTube channel analysis and recommendations'
      })
    );
  });

  it('should have proper input schema', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    
    // Test that input schema is properly defined
    expect(workflowConfig.inputSchema).toBeDefined();
    
    // We can't test zod schemas directly in mocked tests, 
    // but we verify the structure is passed
  });

  it('should have proper output schema', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    
    expect(workflowConfig.outputSchema).toBeDefined();
  });

  it('should define workflow steps', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    
    expect(workflowConfig.steps).toBeDefined();
    expect(workflowConfig.steps).toHaveLength(3);
    
    // Verify step IDs
    const stepIds = workflowConfig.steps.map((step: any) => step.id);
    expect(stepIds).toContain('fetch-channel-data');
    expect(stepIds).toContain('analyze-performance');
    expect(stepIds).toContain('generate-recommendations');
  });

  it('should have fetch-channel-data as first step', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    const fetchStep = workflowConfig.steps[0];
    
    expect(fetchStep.id).toBe('fetch-channel-data');
    expect(fetchStep.type).toBe('agent');
    expect(fetchStep.agent).toBeDefined();
    expect(fetchStep.prompt).toBeDefined();
  });

  it('should have analyze-performance step that depends on channel data', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    const analyzeStep = workflowConfig.steps[1];
    
    expect(analyzeStep.id).toBe('analyze-performance');
    expect(analyzeStep.type).toBe('agent');
    expect(analyzeStep.prompt).toBeDefined();
  });

  it('should have generate-recommendations as final step', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    const recommendStep = workflowConfig.steps[2];
    
    expect(recommendStep.id).toBe('generate-recommendations');
    expect(recommendStep.type).toBe('agent');
    expect(recommendStep.prompt).toBeDefined();
  });

  it('should have output function that processes all steps', () => {
    const workflowConfig = (Workflow as jest.Mock).mock.calls[0][0];
    
    expect(workflowConfig.output).toBeDefined();
    expect(typeof workflowConfig.output).toBe('function');
  });

  describe('workflow execution', () => {
    let mockWorkflow: any;

    beforeEach(() => {
      mockWorkflow = {
        run: jest.fn()
      };
      (Workflow as jest.Mock).mockImplementation(() => mockWorkflow);
    });

    it('should execute workflow with channel analysis parameters', async () => {
      const mockResult = {
        channelMetrics: {
          subscribers: 1000,
          totalViews: 50000,
          videoCount: 100,
          averageViews: 500
        },
        performanceAnalysis: 'Channel shows consistent growth...',
        recommendations: ['Upload more frequently', 'Improve thumbnails'],
        competitiveInsights: undefined
      };

      mockWorkflow.run.mockResolvedValue(mockResult);

      const result = await channelAnalysisWorkflow.run({
        channelId: 'UC123',
        analysisDepth: 'detailed'
      });

      expect(result).toEqual(mockResult);
      expect(mockWorkflow.run).toHaveBeenCalledWith({
        channelId: 'UC123',
        analysisDepth: 'detailed'
      });
    });

    it('should handle comprehensive analysis with competitors', async () => {
      mockWorkflow.run.mockResolvedValue({
        channelMetrics: {},
        performanceAnalysis: '',
        recommendations: [],
        competitiveInsights: 'Compared to competitors...'
      });

      await channelAnalysisWorkflow.run({
        channelId: 'UC123',
        analysisDepth: 'comprehensive',
        competitorChannels: ['UC456', 'UC789']
      });

      expect(mockWorkflow.run).toHaveBeenCalledWith({
        channelId: 'UC123',
        analysisDepth: 'comprehensive',
        competitorChannels: ['UC456', 'UC789']
      });
    });
  });
});