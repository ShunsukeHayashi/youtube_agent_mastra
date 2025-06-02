/**
 * WorkflowChain - Manages a chain of workflows
 */
import { DataMapper } from './dataMapper';
import {
  WorkflowChainConfig,
  ChainExecutionState,
  ChainStatus,
  WorkflowExecutionStatus,
} from './types';

/**
 * Class to manage a chain of workflows that are executed sequentially
 */
export class WorkflowChain {
  private config: WorkflowChainConfig;
  private executionState: ChainExecutionState;

  /**
   * Create a new workflow chain
   * @param config The workflow chain configuration
   */
  constructor(config: WorkflowChainConfig) {
    this.config = config;
    this.executionState = this.createInitialState();
  }

  /**
   * Get the chain configuration
   */
  getConfig(): WorkflowChainConfig {
    return this.config;
  }

  /**
   * Get the current execution state
   */
  getExecutionState(): ChainExecutionState {
    return { ...this.executionState };
  }

  /**
   * Execute the workflow chain
   * @param initialInput Initial input data
   * @returns The final result
   */
  async execute(initialInput: Record<string, any> = {}): Promise<any> {
    this.executionState = this.createInitialState();
    this.executionState.status = 'running';
    this.executionState.startTime = new Date().toISOString();
    this.executionState.contextData = { ...initialInput };

    try {
      // Find workflows that can run in parallel
      const parallelGroups = this.groupWorkflowsByParallel();
      
      // Execute each group in sequence
      for (let groupIndex = 0; groupIndex < parallelGroups.length; groupIndex++) {
        const group = parallelGroups[groupIndex];
        
        // Execute workflows in this group
        if (group.parallel) {
          // Parallel execution
          await this.executeParallelGroup(group.indices);
        } else {
          // Sequential execution
          await this.executeSequentialGroup(group.indices);
        }
        
        // Stop if chain is no longer running
        if (this.executionState.status !== 'running') {
          break;
        }
      }

      // Set final status
      this.executionState.status = 'completed';
      this.executionState.endTime = new Date().toISOString();
      
      return {
        success: true,
        message: 'Workflow chain completed successfully',
        result: this.executionState.contextData,
      };
    } catch (error) {
      this.executionState.status = 'failed';
      this.executionState.endTime = new Date().toISOString();
      
      throw error;
    }
  }

  /**
   * Resume the workflow chain from a specific step
   * @param index The step index to resume from
   * @param contextData The context data to use
   * @returns The final result
   */
  async resumeFrom(index: number, contextData: Record<string, any>): Promise<any> {
    if (index < 0 || index >= this.config.workflows.length) {
      throw new Error(`Invalid step index: ${index}`);
    }

    // Reset execution state
    this.executionState.status = 'running';
    this.executionState.currentStepIndex = index;
    this.executionState.lastUpdateTime = new Date().toISOString();
    this.executionState.contextData = { ...contextData };

    // Reset status for steps from the resumption point
    for (let i = index; i < this.executionState.results.length; i++) {
      this.executionState.results[i].status = 'pending';
      delete this.executionState.results[i].startTime;
      delete this.executionState.results[i].endTime;
      delete this.executionState.results[i].result;
      delete this.executionState.results[i].error;
    }

    try {
      // Find workflows that can run in parallel
      const parallelGroups = this.groupWorkflowsByParallel();
      
      // Find the group containing the resumption index
      let startGroupIndex = 0;
      for (let i = 0; i < parallelGroups.length; i++) {
        if (parallelGroups[i].indices.includes(index)) {
          startGroupIndex = i;
          break;
        }
      }
      
      // Execute each group in sequence, starting from the identified group
      for (let groupIndex = startGroupIndex; groupIndex < parallelGroups.length; groupIndex++) {
        const group = parallelGroups[groupIndex];
        
        // Filter indices to only include those >= the resumption index
        const filteredIndices = group.indices.filter(i => i >= index);
        
        if (filteredIndices.length === 0) {
          continue;
        }
        
        // Execute workflows in this group
        if (group.parallel) {
          // Parallel execution
          await this.executeParallelGroup(filteredIndices);
        } else {
          // Sequential execution
          await this.executeSequentialGroup(filteredIndices);
        }
        
        // Stop if chain is no longer running
        if (this.executionState.status !== 'running') {
          break;
        }
      }

      // Set final status
      this.executionState.status = 'completed';
      this.executionState.endTime = new Date().toISOString();
      
      return {
        success: true,
        message: 'Workflow chain resumed and completed successfully',
        result: this.executionState.contextData,
      };
    } catch (error) {
      this.executionState.status = 'failed';
      this.executionState.endTime = new Date().toISOString();
      
      throw error;
    }
  }

  /**
   * Pause the workflow chain execution
   */
  pause(): void {
    if (this.executionState.status === 'running') {
      this.executionState.status = 'paused';
      this.executionState.lastUpdateTime = new Date().toISOString();
    }
  }

  /**
   * Get the current status of the workflow chain
   */
  getStatus(): ChainStatus {
    return this.executionState.status;
  }

  /**
   * Create the initial execution state
   */
  private createInitialState(): ChainExecutionState {
    const now = new Date().toISOString();
    
    return {
      chainId: this.config.id,
      status: 'pending',
      currentStepIndex: 0,
      startTime: now,
      lastUpdateTime: now,
      contextData: {},
      results: this.config.workflows.map(workflow => ({
        workflowId: workflow.workflow.id,
        status: 'pending',
      })),
    };
  }

  /**
   * Group workflows by parallel execution
   */
  private groupWorkflowsByParallel(): Array<{
    parallel: boolean;
    indices: number[];
  }> {
    const groups: Array<{
      parallel: boolean;
      indices: number[];
    }> = [];
    
    let currentGroup: {
      parallel: boolean;
      indices: number[];
    } | null = null;
    
    // Group workflows by parallel flag
    this.config.workflows.forEach((workflow, index) => {
      const isParallel = !!workflow.parallel;
      
      if (currentGroup === null || currentGroup.parallel !== isParallel) {
        // Start a new group
        currentGroup = {
          parallel: isParallel,
          indices: [index],
        };
        groups.push(currentGroup);
      } else {
        // Add to current group
        currentGroup.indices.push(index);
      }
    });
    
    return groups;
  }

  /**
   * Execute a group of workflows in parallel
   * @param indices The indices of workflows to execute
   */
  private async executeParallelGroup(indices: number[]): Promise<void> {
    const promises = indices.map(index => this.executeWorkflow(index));
    await Promise.all(promises);
  }

  /**
   * Execute a group of workflows sequentially
   * @param indices The indices of workflows to execute
   */
  private async executeSequentialGroup(indices: number[]): Promise<void> {
    for (const index of indices) {
      await this.executeWorkflow(index);
      
      // Stop if chain is no longer running
      if (this.executionState.status !== 'running') {
        break;
      }
    }
  }

  /**
   * Execute a single workflow in the chain
   * @param index The index of the workflow to execute
   */
  private async executeWorkflow(index: number): Promise<void> {
    const workflowConfig = this.config.workflows[index];
    const workflowResult = this.executionState.results[index];
    
    // Update state
    this.executionState.currentStepIndex = index;
    workflowResult.status = 'running';
    workflowResult.startTime = new Date().toISOString();
    this.executionState.lastUpdateTime = workflowResult.startTime;
    
    try {
      // Check if workflow should be skipped based on condition
      if (workflowConfig.condition && !workflowConfig.condition(this.executionState.contextData)) {
        workflowResult.status = 'skipped';
        workflowResult.endTime = new Date().toISOString();
        this.executionState.lastUpdateTime = workflowResult.endTime;
        return;
      }
      
      // Map input data
      const input = DataMapper.applyInputMapping(
        this.executionState.contextData,
        workflowConfig.inputMapping
      );
      
      // Execute workflow
      const result = await workflowConfig.workflow.run(input);
      
      // Update state with result
      workflowResult.status = 'completed';
      workflowResult.result = result;
      workflowResult.endTime = new Date().toISOString();
      this.executionState.lastUpdateTime = workflowResult.endTime;
      
      // Process successful result
      if (result && result.result) {
        // Map output data
        const mappedOutput = DataMapper.applyOutputMapping(
          result.result,
          workflowConfig.outputMapping
        );
        
        // Merge output into context
        this.executionState.contextData = DataMapper.mergeOutputToContext(
          this.executionState.contextData,
          mappedOutput
        );
      }
    } catch (error) {
      // Update state with error
      workflowResult.status = 'failed';
      workflowResult.error = error instanceof Error ? error.message : String(error);
      workflowResult.endTime = new Date().toISOString();
      this.executionState.lastUpdateTime = workflowResult.endTime;
      
      // Handle error based on configuration
      if (workflowConfig.optional) {
        // Continue execution if workflow is optional
        console.warn(`Optional workflow ${workflowConfig.workflow.id} failed:`, error);
      } else {
        // Stop chain execution
        this.executionState.status = 'failed';
        throw error;
      }
    }
  }
}