/// <reference types="jest" />

import { WorkflowChain, DataMapper } from '../src/mastra/orchestration';

// Mock workflows
const mockWorkflow1 = {
  id: 'workflow-1',
  name: 'Test Workflow 1',
  run: jest.fn(),
};

const mockWorkflow2 = {
  id: 'workflow-2',
  name: 'Test Workflow 2',
  run: jest.fn(),
};

const mockWorkflow3 = {
  id: 'workflow-3',
  name: 'Test Workflow 3',
  run: jest.fn(),
};

describe('Workflow Orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DataMapper', () => {
    test('should apply input mapping correctly', () => {
      const context = {
        name: 'Test User',
        profile: {
          age: 30,
          email: 'test@example.com',
        },
        items: [
          { id: 1, value: 'Item 1' },
          { id: 2, value: 'Item 2' },
        ],
      };

      const mapping = {
        userName: 'name',
        userAge: 'profile.age',
        userEmail: 'profile.email',
        firstItem: 'items[0].value',
        secondItem: 'items[1].value',
        literalValue: '"constant value"',
      };

      const result = DataMapper.applyInputMapping(context, mapping);

      expect(result).toEqual({
        userName: 'Test User',
        userAge: 30,
        userEmail: 'test@example.com',
        firstItem: 'Item 1',
        secondItem: 'Item 2',
        literalValue: 'constant value',
      });
    });

    test('should apply output mapping correctly', () => {
      const output = {
        name: 'Test Result',
        stats: {
          count: 42,
          status: 'completed',
        },
        items: [
          { id: 1, label: 'Result 1' },
          { id: 2, label: 'Result 2' },
        ],
      };

      const mapping = {
        name: 'resultName',
        'stats.count': 'resultCount',
        'stats.status': 'resultStatus',
        'items[0].label': 'firstResult',
      };

      const result = DataMapper.applyOutputMapping(output, mapping);

      expect(result).toEqual({
        resultName: 'Test Result',
        resultCount: 42,
        resultStatus: 'completed',
        firstResult: 'Result 1',
      });
    });

    test('should merge output to context correctly', () => {
      const context = {
        user: {
          name: 'Test User',
          id: 123,
        },
        settings: {
          theme: 'dark',
        },
      };

      const output = {
        result: 'Success',
        data: {
          value: 42,
          items: ['a', 'b', 'c'],
        },
      };

      const result = DataMapper.mergeOutputToContext(context, output);

      expect(result).toEqual({
        user: {
          name: 'Test User',
          id: 123,
        },
        settings: {
          theme: 'dark',
        },
        result: 'Success',
        data: {
          value: 42,
          items: ['a', 'b', 'c'],
        },
      });
    });
  });

  describe('WorkflowChain', () => {
    test('should execute workflows in sequence', async () => {
      // Setup mock implementations
      mockWorkflow1.run.mockResolvedValue({
        success: true,
        result: { name: 'Result 1' },
      });
      
      mockWorkflow2.run.mockResolvedValue({
        success: true,
        result: { count: 42 },
      });

      // Create workflow chain
      const chain = new WorkflowChain({
        id: 'test-chain',
        description: 'Test workflow chain',
        workflows: [
          {
            workflow: mockWorkflow1,
            outputMapping: {
              name: 'result1.name',
            },
          },
          {
            workflow: mockWorkflow2,
            outputMapping: {
              count: 'result2.count',
            },
          },
        ],
      });

      // Execute chain
      const result = await chain.execute({ initialData: 'test' });

      // Verify results
      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        initialData: 'test',
        result1: {
          name: 'Result 1',
        },
        result2: {
          count: 42,
        },
      });

      // Verify workflow calls
      expect(mockWorkflow1.run).toHaveBeenCalledTimes(1);
      expect(mockWorkflow2.run).toHaveBeenCalledTimes(1);
    });

    test('should skip workflows based on conditions', async () => {
      // Setup mock implementations
      mockWorkflow1.run.mockResolvedValue({
        success: true,
        result: { flag: false },
      });
      
      mockWorkflow2.run.mockResolvedValue({
        success: true,
        result: { data: 'Workflow 2 Result' },
      });

      // Create workflow chain
      const chain = new WorkflowChain({
        id: 'test-chain',
        description: 'Test workflow chain with conditions',
        workflows: [
          {
            workflow: mockWorkflow1,
            outputMapping: {
              flag: 'flag',
            },
          },
          {
            workflow: mockWorkflow2,
            condition: (data) => data.flag === true,
            outputMapping: {
              data: 'conditionalResult',
            },
          },
        ],
      });

      // Execute chain
      const result = await chain.execute();

      // Verify results
      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        flag: false,
      });

      // Verify workflow calls
      expect(mockWorkflow1.run).toHaveBeenCalledTimes(1);
      expect(mockWorkflow2.run).not.toHaveBeenCalled();
    });

    test('should handle optional workflows that fail', async () => {
      // Setup mock implementations
      mockWorkflow1.run.mockResolvedValue({
        success: true,
        result: { name: 'Result 1' },
      });
      
      mockWorkflow2.run.mockRejectedValue(new Error('Workflow 2 failed'));
      
      mockWorkflow3.run.mockResolvedValue({
        success: true,
        result: { data: 'Result 3' },
      });

      // Create workflow chain
      const chain = new WorkflowChain({
        id: 'test-chain',
        description: 'Test workflow chain with optional workflow',
        workflows: [
          {
            workflow: mockWorkflow1,
            outputMapping: {
              name: 'result1.name',
            },
          },
          {
            workflow: mockWorkflow2,
            optional: true,
            outputMapping: {
              data: 'result2.data',
            },
          },
          {
            workflow: mockWorkflow3,
            outputMapping: {
              data: 'result3.data',
            },
          },
        ],
      });

      // Execute chain
      const result = await chain.execute();

      // Verify results
      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        result1: {
          name: 'Result 1',
        },
        result3: {
          data: 'Result 3',
        },
      });

      // Verify workflow calls
      expect(mockWorkflow1.run).toHaveBeenCalledTimes(1);
      expect(mockWorkflow2.run).toHaveBeenCalledTimes(1);
      expect(mockWorkflow3.run).toHaveBeenCalledTimes(1);
    });

    test('should fail when a required workflow fails', async () => {
      // Setup mock implementations
      mockWorkflow1.run.mockResolvedValue({
        success: true,
        result: { name: 'Result 1' },
      });
      
      mockWorkflow2.run.mockRejectedValue(new Error('Workflow 2 failed'));

      // Create workflow chain
      const chain = new WorkflowChain({
        id: 'test-chain',
        description: 'Test workflow chain with required workflow',
        workflows: [
          {
            workflow: mockWorkflow1,
            outputMapping: {
              name: 'result1.name',
            },
          },
          {
            workflow: mockWorkflow2,
            outputMapping: {
              data: 'result2.data',
            },
          },
        ],
      });

      // Execute chain and expect failure
      await expect(chain.execute()).rejects.toThrow('Workflow 2 failed');

      // Verify workflow calls
      expect(mockWorkflow1.run).toHaveBeenCalledTimes(1);
      expect(mockWorkflow2.run).toHaveBeenCalledTimes(1);
    });
  });
});