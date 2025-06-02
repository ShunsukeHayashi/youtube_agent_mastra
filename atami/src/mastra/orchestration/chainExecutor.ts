/**
 * ChainExecutor - Controls the execution of workflow chains
 */
import { WorkflowChain } from './workflowChain';
import { ChainExecutorConfig, ErrorHandlingConfig } from './types';

/**
 * Class to control the execution of workflow chains
 */
export class ChainExecutor {
  private chain: WorkflowChain;
  private config: ChainExecutorConfig;
  private errorConfig: ErrorHandlingConfig;
  private isCancelled: boolean = false;
  private isPaused: boolean = false;

  /**
   * Create a new chain executor
   * @param chain The workflow chain to execute
   * @param config Configuration for the executor
   * @param errorConfig Configuration for error handling
   */
  constructor(
    chain: WorkflowChain,
    config: ChainExecutorConfig = {},
    errorConfig: ErrorHandlingConfig = { maxRetries: 0, retryDelay: 1000 }
  ) {
    this.chain = chain;
    this.config = config;
    this.errorConfig = errorConfig;
  }

  /**
   * Execute the workflow chain
   * @param input Initial input data
   * @returns The final result
   */
  async execute(input: Record<string, any> = {}): Promise<any> {
    this.isCancelled = false;
    this.isPaused = false;
    
    try {
      const result = await this.chain.execute(input);
      
      // Call completion callback if provided
      if (this.config.onChainComplete) {
        this.config.onChainComplete(result);
      }
      
      return result;
    } catch (error) {
      // Handle error based on configuration
      if (this.errorConfig.errorCallback) {
        return this.errorConfig.errorCallback(
          error instanceof Error ? error : new Error(String(error)),
          this.chain.getExecutionState().contextData
        );
      }
      
      throw error;
    }
  }

  /**
   * Resume the workflow chain from a specific step
   * @param index The step index to resume from
   * @param contextData The context data to use
   * @returns The final result
   */
  async resumeFrom(
    index: number,
    contextData: Record<string, any>
  ): Promise<any> {
    this.isCancelled = false;
    this.isPaused = false;
    
    try {
      const result = await this.chain.resumeFrom(index, contextData);
      
      // Call completion callback if provided
      if (this.config.onChainComplete) {
        this.config.onChainComplete(result);
      }
      
      return result;
    } catch (error) {
      // Handle error based on configuration
      if (this.errorConfig.errorCallback) {
        return this.errorConfig.errorCallback(
          error instanceof Error ? error : new Error(String(error)),
          this.chain.getExecutionState().contextData
        );
      }
      
      throw error;
    }
  }

  /**
   * Pause the workflow chain execution
   */
  pause(): void {
    this.isPaused = true;
    this.chain.pause();
  }

  /**
   * Resume the workflow chain execution
   */
  resume(): void {
    if (this.isPaused && !this.isCancelled) {
      this.isPaused = false;
      
      // Resume from the current step
      const state = this.chain.getExecutionState();
      this.resumeFrom(state.currentStepIndex, state.contextData)
        .catch(error => {
          console.error('Error resuming workflow chain:', error);
        });
    }
  }

  /**
   * Cancel the workflow chain execution
   */
  cancel(): void {
    this.isCancelled = true;
    this.isPaused = true;
    this.chain.pause();
  }

  /**
   * Get the current execution state
   */
  getExecutionState(): any {
    return this.chain.getExecutionState();
  }
}